from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from utils.responses import ApiResponse


class ApiRoot(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return ApiResponse.success(api_info, message="connected")
