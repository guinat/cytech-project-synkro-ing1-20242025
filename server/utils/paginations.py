from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination
from .api_responses import APIResponse


class StandardResultsPagination(PageNumberPagination):
    """
    Standard pagination for most API views
    """
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """
        Returns a standardized paginated response
        """
        return APIResponse.paginated_response(data, self, self.request)


class LargeResultsPagination(PageNumberPagination):
    """
    Pagination for large result sets
    """
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 500
    
    def get_paginated_response(self, data):
        """
        Returns a standardized paginated response
        """
        return APIResponse.paginated_response(data, self, self.request)


class SmallResultsPagination(PageNumberPagination):
    """
    Pagination for small lists
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        """
        Returns a standardized paginated response
        """
        return APIResponse.paginated_response(data, self, self.request)


class CustomLimitOffsetPagination(LimitOffsetPagination):
    """
    Pagination based on limit and offset
    """
    default_limit = 25
    limit_query_param = 'limit'
    offset_query_param = 'offset'
    max_limit = 100
    
    def get_paginated_response(self, data):
        """
        Returns a standardized paginated response, adapted for limit/offset
        """
        return APIResponse.paginated_response(data, self, self.request) 