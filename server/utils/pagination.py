from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from typing import Dict, Any, List
from collections import OrderedDict


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data: List[Dict[str, Any]]) -> Response:
        return Response(OrderedDict([
            ('status', 'success'),
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('results', data),
        ]))
    
    def get_paginated_response_schema(self, schema: Dict[str, Any]) -> Dict[str, Any]:
        return {
            'type': 'object',
            'properties': {
                'status': {
                    'type': 'string',
                    'example': 'success'
                },
                'count': {
                    'type': 'integer',
                    'example': 123,
                },
                'next': {
                    'type': 'string',
                    'nullable': True,
                    'format': 'uri',
                    'example': 'https://api.example.org/accounts/?page=4',
                },
                'previous': {
                    'type': 'string',
                    'nullable': True,
                    'format': 'uri',
                    'example': 'https://api.example.org/accounts/?page=2',
                },
                'results': schema,
            }
        } 