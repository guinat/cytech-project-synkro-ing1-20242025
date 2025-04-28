from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Device, DeviceCommand
from rooms.models import Room
from .serializers import DeviceSerializer, DeviceCommandSerializer
from utils.responses import ApiResponse
from utils.permissions import IsHomeOwnerOrMember
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.generics import ListAPIView, GenericAPIView
from rest_framework.response import Response
from .device_catalogue import DEVICE_TYPES
from rest_framework.views import APIView
from django.utils.dateparse import parse_datetime
from django.db.models import Q
from datetime import datetime, timedelta, timezone
import pytz
from django.db import transaction
from django.utils import timezone
from django.contrib.auth import get_user_model
from users.models_action_history import ActionHistory

User = get_user_model()



class HomeDeviceListView(ListAPIView):
    serializer_class = DeviceSerializer
    permission_classes = [IsHomeOwnerOrMember]

    def get_queryset(self):
        home_pk = self.kwargs['home_pk']
        return Device.objects.filter(room__home__id=home_pk)

class RoomDeviceListView(ListAPIView):
    serializer_class = DeviceSerializer
    permission_classes = [IsHomeOwnerOrMember]

    def get_queryset(self):
        room_pk = self.kwargs['room_pk']
        return Device.objects.filter(room__id=room_pk)


class DeviceTypePublicListView(GenericAPIView):
    permission_classes = [AllowAny]
    def get(self, request, *args, **kwargs):
        device_types = [{**d, "id": d["type"]} for d in DEVICE_TYPES]
        return Response(device_types)

class DeviceViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceSerializer
    permission_classes = [IsHomeOwnerOrMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['type']
    search_fields = ['name', 'product_code']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        room_pk = self.kwargs.get('room_pk')
        return Device.objects.filter(room__id=room_pk)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        room_pk = self.kwargs.get('room_pk')
        if self.action != 'list':
            context['room'] = get_object_or_404(Room, id=room_pk)
        else:
            context['room'] = Room.objects.filter(id=room_pk).first()
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device = serializer.save()
        user = request.user
        if user.is_authenticated and hasattr(user, 'points'):
            user.points += 15
            user.save()
        # Historique action utilisateur
        user = request.user if request.user.is_authenticated else None
        ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0] or request.META.get('REMOTE_ADDR')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        if user:
            ActionHistory.objects.create(
                user=user,
                action_type="CREATE_DEVICE",
                target_id=str(device.id),
                target_repr=str(device),
                ip_address=ip,
                user_agent=user_agent
            )
        return ApiResponse.success(
            DeviceSerializer(device).data,
            message="Device created successfully",
            status_code=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        device = serializer.save()
        return ApiResponse.success(
            DeviceSerializer(device).data,
            message="Device updated successfully"
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return ApiResponse.success(
            message="Device deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )


class EnergyConsumptionView(APIView): #TODO?: Check logics & data
    def get(self, request):
        power_kw = 5 # TODO: Get power from device

        home_id = request.GET.get('home_id')
        room_id = request.GET.get('room_id')
        device_id = request.GET.get('device_id')
        date_start = request.GET.get('date_start')
        date_end = request.GET.get('date_end')
        granularity = request.GET.get('granularity', 'day')
        cumulative = request.GET.get('cumulative', 'false').lower() == 'true'
    
        

        tz = pytz.UTC

        if date_start:
            date_start = parse_datetime(date_start)
            if date_start and date_start.tzinfo is None:
                date_start = date_start.replace(tzinfo=tz)
        if date_end:
            date_end = parse_datetime(date_end)
            if date_end and date_end.tzinfo is None:
                date_end = date_end.replace(tzinfo=tz)
        if not date_end:
            date_end = datetime.now(tz)
        if not date_start:
            date_start = date_end - timedelta(days=1)

        devices = Device.objects.all()
        if device_id:
            devices = devices.filter(id=device_id)
        elif room_id:
            devices = devices.filter(room__id=room_id)
        elif home_id:
            devices = devices.filter(room__home__id=home_id)

        results = []
        total = 0.0

        for device in devices:
            last_before = device.commands.filter(
                capability='on_off',
                status='success',
                executed_at__lt=date_start
            ).order_by('-executed_at').first()
            if last_before and last_before.parameters.get('on_off'):
                last_on_time = date_start
            else:
                last_on_time = None

            cmds = device.commands.filter(
                capability='on_off',
                status='success',
                executed_at__gte=date_start,
                executed_at__lte=date_end
            ).order_by('executed_at')


            periods = []
            for cmd in cmds:
                is_on = cmd.parameters.get('on_off')
                if is_on and last_on_time is None:
                    last_on_time = cmd.executed_at
                elif not is_on and last_on_time:
                    if cmd.executed_at > last_on_time:
                        periods.append((last_on_time, cmd.executed_at))
                    last_on_time = None
            if last_on_time:
                periods.append((last_on_time, date_end))

            consumption_by_period = {}
            for start, end in periods:
                cur = start
                while cur < end:
                    if granularity == 'minute':
                        next_cur = (cur + timedelta(minutes=1)).replace(second=0, microsecond=0)
                    elif granularity == 'hour':
                        next_cur = (cur + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
                    elif granularity == 'month':
                        next_month = (cur.replace(day=1) + timedelta(days=32)).replace(day=1)
                        next_cur = next_month
                    else:  # day
                        next_cur = (cur + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)

                    period_end = min(next_cur, end)

                    if granularity == 'minute':
                        key = cur.strftime('%Y-%m-%d %H:%M')
                    elif granularity == 'hour':
                        key = cur.strftime('%Y-%m-%d %H:00')
                    elif granularity == 'month':
                        key = cur.strftime('%Y-%m')
                    else:
                        key = cur.strftime('%Y-%m-%d')

                    duration_h = (period_end - cur).total_seconds() / 3600
                    consumption_by_period.setdefault(key, 0.0)
                    consumption_by_period[key] += duration_h * power_kw

                    cur = period_end

            device_total = sum(consumption_by_period.values())
            total += device_total

            filled = {}
            cur = date_start
            while cur <= date_end:
                if granularity == 'minute':
                    key = cur.strftime('%Y-%m-%d %H:%M')
                    cur += timedelta(minutes=1)
                elif granularity == 'hour':
                    key = cur.strftime('%Y-%m-%d %H:00')
                    cur += timedelta(hours=1)
                elif granularity == 'day':
                    key = cur.strftime('%Y-%m-%d')
                    cur += timedelta(days=1)
                else:  # month
                    key = cur.strftime('%Y-%m')
                    year = cur.year + (cur.month // 12)
                    month = cur.month % 12 + 1
                    cur = cur.replace(year=year, month=month, day=1)
                filled[key] = consumption_by_period.get(key, 0.0)

            filled = dict(sorted(filled.items()))

            if cumulative:
                cum = {}
                running = 0.0
                for k, v in filled.items():
                    running += v
                    cum[k] = running
                filled = cum

            results.append({
                'device_id': str(device.id),
                'device_name': device.name,
                'room_id': str(device.room.id),
                'room_name': device.room.name,
                'home_id': str(device.room.home.id),
                'home_name': device.room.home.name,
                'consumption': filled,
                'total': device_total,
            })

        return Response({
            'devices': results,
            'total': total,
            'granularity': granularity,
            'cumulative': cumulative,
            'date_start': date_start,
            'date_end': date_end,
        })


class DeviceCommandViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceCommandSerializer
    permission_classes = [IsHomeOwnerOrMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'capability']
    search_fields = ['capability']
    ordering_fields = ['created_at', 'executed_at']
    ordering = ['-created_at']
    http_method_names = ['get', 'post']

    def get_queryset(self):
        device_pk = self.kwargs.get('device_pk')
        return DeviceCommand.objects.filter(device__id=device_pk)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        device_pk = self.kwargs.get('device_pk')
        context['device'] = get_object_or_404(Device, id=device_pk)
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return ApiResponse.error(
                message="Validation error",
                errors=serializer.errors,
                status_code=400
            )
        command = serializer.save()

        device = command.device
        capability = command.capability
        value = command.parameters.get(capability)
        if capability in device.state:
            device.state[capability] = value
            device.save()
        else:
            pass

        command.status = DeviceCommand.Status.SUCCESS
        command.executed_at = timezone.now()
        command.response = {"result": "success", "applied": {capability: value}}
        command.save()

        return ApiResponse.success(
            DeviceCommandSerializer(command).data,
            message="Command sent and executed successfully",
            status_code=status.HTTP_201_CREATED
        )
