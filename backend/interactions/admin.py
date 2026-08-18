from django.contrib import admin

from interactions.models import Bookmark, Interaction


class ReadOnlyAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Bookmark)
class BookmarkAdmin(ReadOnlyAdmin):
    list_display = ("user", "opportunity", "created_at")
    search_fields = ("user__email", "opportunity__title")
    readonly_fields = tuple(field.name for field in Bookmark._meta.fields)


@admin.register(Interaction)
class InteractionAdmin(ReadOnlyAdmin):
    list_display = ("interaction_type", "user", "opportunity", "occurred_at")
    list_filter = ("interaction_type",)
    search_fields = ("user__email", "opportunity__title")
    readonly_fields = tuple(field.name for field in Interaction._meta.fields)
