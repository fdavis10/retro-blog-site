from rest_framework import permissions


class IsApprovedUser(permissions.BasePermission):

    message = 'Вы должны быть одобрены администратором для доступа к этому ресурсу.'

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_approved


class IsAdminUser(permissions.BasePermission):
    message = 'Только администраторы могут выполнять это действие.'

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin_user


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user or obj == request.user


class IsCommentAuthorOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.author == request.user


class IsPostAuthorOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return obj.author == request.user or (request.user and request.user.is_admin_user)