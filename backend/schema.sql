# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AccountsUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    email = models.CharField(unique=True, max_length=254)
    username = models.CharField(unique=True, max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    is_active = models.BooleanField()
    is_staff = models.BooleanField()
    date_joined = models.DateTimeField()
    age = models.PositiveIntegerField(blank=True, null=True)
    allow_peer_matching = models.BooleanField()
    avatar = models.CharField(max_length=100, blank=True, null=True)
    bio = models.TextField()
    crisis_contact_phone = models.CharField(max_length=20)
    gender = models.CharField(max_length=20)
    is_anonymous_preferred = models.BooleanField()
    last_active = models.DateTimeField()
    last_mood_checkin = models.DateTimeField(blank=True, null=True)
    license_number = models.CharField(max_length=100)
    notification_preferences = models.JSONField()
    onboarding_completed = models.BooleanField()
    professional_title = models.CharField(max_length=200)
    specializations = models.JSONField()
    years_experience = models.PositiveIntegerField(blank=True, null=True)
    role = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = 'accounts_user'


class AccountsUserGroups(models.Model):
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    group = models.ForeignKey('AuthGroup', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'accounts_user_groups'
        unique_together = (('user', 'group'),)


class AccountsUserUserPermissions(models.Model):
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'accounts_user_user_permissions'
        unique_together = (('user', 'permission'),)


class AssessmentsAssessment(models.Model):
    total_score = models.PositiveIntegerField()
    risk_level = models.CharField(max_length=20)
    interpretation = models.TextField()
    recommendations = models.JSONField()
    completed_at = models.DateTimeField()
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    assessment_type = models.ForeignKey('AssessmentsType', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'assessments_assessment'


class AssessmentsAssignment(models.Model):
    assigned_date = models.DateTimeField()
    due_date = models.DateTimeField(blank=True, null=True)
    priority = models.CharField(max_length=10)
    notes = models.TextField()
    is_completed = models.BooleanField()
    completed_at = models.DateTimeField(blank=True, null=True)
    reminder_sent = models.BooleanField()
    assessment_type = models.ForeignKey('AssessmentsType', models.DO_NOTHING)
    client = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    guide = models.ForeignKey(AccountsUser, models.DO_NOTHING, related_name='assessmentsassignment_guide_set')

    class Meta:
        managed = False
        db_table = 'assessments_assignment'
        unique_together = (('guide', 'client', 'assessment_type'),)


class AssessmentsQuestion(models.Model):
    question_number = models.PositiveIntegerField()
    question_text = models.TextField()
    options = models.JSONField()
    is_reverse_scored = models.BooleanField()
    assessment_type = models.ForeignKey('AssessmentsType', models.DO_NOTHING)
    question_type = models.CharField(max_length=20)
    is_required = models.BooleanField()
    min_value = models.IntegerField(blank=True, null=True)
    max_value = models.IntegerField(blank=True, null=True)
    scale_labels = models.JSONField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'assessments_question'
        unique_together = (('assessment_type', 'question_number'),)


class AssessmentsQuestionOption(models.Model):
    text = models.CharField(max_length=500)
    score = models.IntegerField()
    order = models.PositiveIntegerField()
    question = models.ForeignKey(AssessmentsQuestion, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'assessments_question_option'


class AssessmentsRecommendation(models.Model):
    risk_level = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    description = models.TextField()
    action_items = models.JSONField()
    resources = models.JSONField()
    priority = models.PositiveIntegerField()
    assessment_type = models.ForeignKey('AssessmentsType', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'assessments_recommendation'


class AssessmentsRequest(models.Model):
    request_type = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    description = models.TextField()
    justification = models.TextField()
    proposed_questions = models.JSONField()
    expected_outcomes = models.TextField()
    status = models.CharField(max_length=15)
    admin_notes = models.TextField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    reviewed_at = models.DateTimeField(blank=True, null=True)
    requester = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    reviewed_by = models.ForeignKey(AccountsUser, models.DO_NOTHING, related_name='assessmentsrequest_reviewed_by_set', blank=True, null=True)
    target_assessment = models.ForeignKey('AssessmentsType', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'assessments_request'


class AssessmentsResponse(models.Model):
    assessment = models.ForeignKey(AssessmentsAssessment, models.DO_NOTHING)
    question = models.ForeignKey(AssessmentsQuestion, models.DO_NOTHING)
    selected_option_id = models.ForeignKey(AssessmentsQuestionOption, models.DO_NOTHING, blank=True, null=True)
    selected_option_ids = models.JSONField(blank=True, null=True)
    text_response = models.TextField(blank=True, null=True)
    numeric_response = models.IntegerField(blank=True, null=True)
    response_value = models.IntegerField()
    response_time = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'assessments_response'
        unique_together = (('assessment', 'question'),)


class AssessmentsType(models.Model):
    name = models.CharField(unique=True, max_length=10)
    display_name = models.CharField(max_length=100)
    description = models.TextField()
    instructions = models.TextField()
    total_questions = models.PositiveIntegerField()
    max_score = models.PositiveIntegerField()
    is_active = models.BooleanField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'assessments_type'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)
    name = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class CommunityChatMessage(models.Model):
    content = models.TextField()
    is_anonymous = models.BooleanField()
    is_system_message = models.BooleanField()
    created_at = models.DateTimeField()
    author = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    room = models.ForeignKey('CommunityChatRoom', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'community_chat_message'


class CommunityChatRoom(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    topic = models.CharField(max_length=100)
    max_participants = models.PositiveIntegerField()
    is_active = models.BooleanField()
    is_moderated = models.BooleanField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'community_chat_room'


class CommunityChatRoomModerators(models.Model):
    chatroom = models.ForeignKey(CommunityChatRoom, models.DO_NOTHING)
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'community_chat_room_moderators'
        unique_together = (('chatroom', 'user'),)


class CommunityCommentLike(models.Model):
    created_at = models.DateTimeField()
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    comment = models.ForeignKey('CommunityForumComment', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'community_comment_like'
        unique_together = (('user', 'comment'),)


class CommunityForumCategory(models.Model):
    name = models.CharField(unique=True, max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)
    color = models.CharField(max_length=7)
    is_active = models.BooleanField()
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'community_forum_category'


class CommunityForumComment(models.Model):
    content = models.TextField()
    is_anonymous = models.BooleanField()
    is_approved = models.BooleanField()
    like_count = models.PositiveIntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    author = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    parent_comment = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)
    post = models.ForeignKey('CommunityForumPost', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'community_forum_comment'


class CommunityForumPost(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    is_anonymous = models.BooleanField()
    is_pinned = models.BooleanField()
    is_locked = models.BooleanField()
    is_approved = models.BooleanField()
    view_count = models.PositiveIntegerField()
    like_count = models.PositiveIntegerField()
    author_mood = models.CharField(max_length=20)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    last_activity = models.DateTimeField()
    author = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    category = models.ForeignKey(CommunityForumCategory, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'community_forum_post'


class CommunityModerationReport(models.Model):
    report_type = models.CharField(max_length=30)
    description = models.TextField()
    status = models.CharField(max_length=20)
    moderator_notes = models.TextField()
    action_taken = models.TextField()
    created_at = models.DateTimeField()
    resolved_at = models.DateTimeField(blank=True, null=True)
    moderator = models.ForeignKey(AccountsUser, models.DO_NOTHING, blank=True, null=True)
    reported_comment = models.ForeignKey(CommunityForumComment, models.DO_NOTHING, blank=True, null=True)
    reported_post = models.ForeignKey(CommunityForumPost, models.DO_NOTHING, blank=True, null=True)
    reported_user = models.ForeignKey(AccountsUser, models.DO_NOTHING, related_name='communitymoderationreport_reported_user_set', blank=True, null=True)
    reporter = models.ForeignKey(AccountsUser, models.DO_NOTHING, related_name='communitymoderationreport_reporter_set')

    class Meta:
        managed = False
        db_table = 'community_moderation_report'


class CommunityPeerSupportMatch(models.Model):
    preferred_topics = models.JSONField()
    preferred_age_range = models.CharField(max_length=20)
    preferred_gender = models.CharField(max_length=20)
    status = models.CharField(max_length=20)
    matched_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    requester_rating = models.PositiveIntegerField(blank=True, null=True)
    supporter_rating = models.PositiveIntegerField(blank=True, null=True)
    feedback = models.TextField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    requester = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    supporter = models.ForeignKey(AccountsUser, models.DO_NOTHING, related_name='communitypeersupportmatch_supporter_set', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'community_peer_support_match'


class CommunityPostLike(models.Model):
    created_at = models.DateTimeField()
    post = models.ForeignKey(CommunityForumPost, models.DO_NOTHING)
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'community_post_like'
        unique_together = (('user', 'post'),)


class CrisisAlert(models.Model):
    alert_type = models.CharField(max_length=30)
    severity_level = models.CharField(max_length=20)
    trigger_content = models.TextField()
    context_data = models.JSONField()
    status = models.CharField(max_length=20)
    response_notes = models.TextField()
    follow_up_required = models.BooleanField()
    follow_up_completed = models.BooleanField()
    follow_up_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField()
    acknowledged_at = models.DateTimeField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    responder = models.ForeignKey(AccountsUser, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING, related_name='crisisalert_user_set')

    class Meta:
        managed = False
        db_table = 'crisis_alert'


class CrisisHotline(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    hotline_type = models.CharField(max_length=30)
    phone_number = models.CharField(max_length=20)
    text_number = models.CharField(max_length=20)
    website = models.CharField(max_length=200)
    chat_url = models.CharField(max_length=200)
    is_24_7 = models.BooleanField()
    hours_description = models.CharField(max_length=200)
    languages = models.JSONField()
    country = models.CharField(max_length=100)
    regions_served = models.JSONField()
    is_international = models.BooleanField()
    is_active = models.BooleanField()
    priority_order = models.PositiveIntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'crisis_hotline'


class CrisisResource(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    resource_type = models.CharField(max_length=30)
    instructions = models.TextField()
    estimated_time_minutes = models.PositiveIntegerField(blank=True, null=True)
    crisis_situations = models.JSONField()
    age_appropriate = models.JSONField()
    is_active = models.BooleanField()
    priority_order = models.PositiveIntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'crisis_resource'


class CrisisUserSafetyPlan(models.Model):
    warning_signs = models.JSONField()
    triggers = models.JSONField()
    coping_strategies = models.JSONField()
    distractions = models.JSONField()
    support_contacts = models.JSONField()
    professional_contacts = models.JSONField()
    environment_safety = models.JSONField()
    emergency_contacts = models.JSONField()
    emergency_plan = models.TextField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    last_reviewed = models.DateTimeField(blank=True, null=True)
    user = models.OneToOneField(AccountsUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'crisis_user_safety_plan'


class DjangoAdminLog(models.Model):
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.PositiveSmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    action_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class WellnessAchievement(models.Model):
    name = models.CharField(unique=True, max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20)
    icon = models.CharField(max_length=50)
    points_reward = models.PositiveIntegerField()
    criteria = models.JSONField()
    is_repeatable = models.BooleanField()
    is_active = models.BooleanField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'wellness_achievement'


class WellnessDailyChallenge(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    challenge_type = models.CharField(max_length=20)
    instructions = models.TextField()
    points_reward = models.PositiveIntegerField()
    target_value = models.PositiveIntegerField(blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(blank=True, null=True)
    is_active = models.BooleanField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'wellness_daily_challenge'


class WellnessMoodEntry(models.Model):
    mood_rating = models.PositiveIntegerField()
    energy_level = models.PositiveIntegerField()
    anxiety_level = models.PositiveIntegerField()
    sleep_quality = models.PositiveIntegerField()
    notes = models.TextField()
    activities = models.JSONField()
    triggers = models.JSONField()
    date = models.DateField()
    created_at = models.DateTimeField()
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wellness_mood_entry'
        unique_together = (('user', 'date'),)


class WellnessTip(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    tip_type = models.CharField(max_length=20)
    target_mood = models.JSONField()
    target_age_range = models.CharField(max_length=20)
    is_active = models.BooleanField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'wellness_tip'


class WellnessUserAchievement(models.Model):
    earned_at = models.DateTimeField()
    points_earned = models.PositiveIntegerField()
    achievement = models.ForeignKey(WellnessAchievement, models.DO_NOTHING)
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wellness_user_achievement'
        unique_together = (('user', 'achievement'),)


class WellnessUserChallengeCompletion(models.Model):
    completed_at = models.DateTimeField()
    completion_date = models.DateField()
    completion_value = models.PositiveIntegerField(blank=True, null=True)
    notes = models.TextField()
    points_earned = models.PositiveIntegerField()
    challenge = models.ForeignKey(WellnessDailyChallenge, models.DO_NOTHING)
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wellness_user_challenge_completion'
        unique_together = (('user', 'challenge', 'completion_date'),)


class WellnessUserPoints(models.Model):
    total_points = models.PositiveIntegerField()
    current_streak = models.PositiveIntegerField()
    longest_streak = models.PositiveIntegerField()
    last_activity_date = models.DateField(blank=True, null=True)
    level = models.PositiveIntegerField()
    points_to_next_level = models.PositiveIntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    user = models.OneToOneField(AccountsUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wellness_user_points'


class WellnessUserTip(models.Model):
    shown_at = models.DateTimeField()
    is_helpful = models.BooleanField(blank=True, null=True)
    user = models.ForeignKey(AccountsUser, models.DO_NOTHING)
    tip = models.ForeignKey(WellnessTip, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'wellness_user_tip'
        unique_together = (('user', 'tip'),)
