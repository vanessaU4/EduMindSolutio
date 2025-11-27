from django.contrib import admin
from .models import MoodEntry, MoodAnalysisSession, MoodTrend, MoodInsight

@admin.register(MoodEntry)
class MoodEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'emotion', 'confidence', 'timestamp', 'created_at']
    list_filter = ['emotion', 'timestamp', 'created_at']
    search_fields = ['user__username', 'user__email', 'emotion', 'notes']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-timestamp']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'emotion', 'confidence', 'timestamp')
        }),
        ('Analysis Data', {
            'fields': ('emotions_breakdown',),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('notes', 'image_data'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(MoodAnalysisSession)
class MoodAnalysisSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user', 'started_at', 'ended_at', 'analysis_method', 'success_rate']
    list_filter = ['analysis_method', 'started_at']
    search_fields = ['session_id', 'user__username', 'user__email']
    readonly_fields = ['started_at']
    ordering = ['-started_at']
    
    def success_rate(self, obj):
        return f"{obj.get_success_rate()}%"
    success_rate.short_description = 'Success Rate'


@admin.register(MoodTrend)
class MoodTrendAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'dominant_emotion', 'average_confidence', 'total_entries']
    list_filter = ['dominant_emotion', 'date']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-date']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(MoodInsight)
class MoodInsightAdmin(admin.ModelAdmin):
    list_display = ['user', 'insight_type', 'title', 'confidence_score', 'is_active', 'is_acknowledged', 'created_at']
    list_filter = ['insight_type', 'is_active', 'is_acknowledged', 'created_at']
    search_fields = ['user__username', 'user__email', 'title', 'description']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'insight_type', 'title', 'description')
        }),
        ('Metadata', {
            'fields': ('confidence_score', 'date_range_start', 'date_range_end')
        }),
        ('Status', {
            'fields': ('is_active', 'is_acknowledged', 'acknowledged_at')
        }),
        ('Related Data', {
            'fields': ('related_entries',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    filter_horizontal = ['related_entries']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')
