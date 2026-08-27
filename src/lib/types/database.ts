// Hand-written types mirroring supabase/migrations/*.sql.
// If the schema changes, update this file (or regenerate with the Supabase CLI:
// `supabase gen types typescript --project-id yuvseplshemchpwoknuf > src/lib/types/database.ts`).

export type AccountType = "student" | "teacher";
export type TeachingMethod = "online" | "offline" | "both";
export type EducationSystem =
  | "national"
  | "azhari"
  | "american"
  | "british"
  | "ib"
  | "stem"
  | "other";
export type AppRole = "admin";
export type SupportCategory = "technical" | "report_teacher" | "inquiry" | "suggestion" | "other";
export type SupportStatus = "open" | "resolved";

// @supabase/postgrest-js requires every table entry to also declare
// `Relationships` (used for typed embedded-resource joins) and every schema
// to declare `Views` / `Functions` alongside `Tables` — even when empty —
// or its generic helpers silently collapse to `never`. We don't use the
// generated embedded-join typing (data layer queries build their own
// shapes), so Relationships is just `[]` everywhere.
type NoRelationships = [];

export interface Database {
  public: {
    Tables: {
      governorates: {
        Row: { id: number; name: string; created_at: string };
        Insert: { id?: number; name: string; created_at?: string };
        Update: { id?: number; name?: string; created_at?: string };
        Relationships: NoRelationships;
      };
      cities: {
        Row: { id: number; governorate_id: number; name: string; created_at: string };
        Insert: { id?: number; governorate_id: number; name: string; created_at?: string };
        Update: { id?: number; governorate_id?: number; name?: string; created_at?: string };
        Relationships: NoRelationships;
      };
      subjects: {
        Row: { id: number; name: string; created_at: string };
        Insert: { id?: number; name: string; created_at?: string };
        Update: { id?: number; name?: string; created_at?: string };
        Relationships: NoRelationships;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          account_type: AccountType;
          governorate_id: number | null;
          city_id: number | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
          account_type?: AccountType;
          governorate_id?: number | null;
          city_id?: number | null;
          phone?: string | null;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          account_type?: AccountType;
          governorate_id?: number | null;
          city_id?: number | null;
          phone?: string | null;
        };
        Relationships: NoRelationships;
      };
      user_roles: {
        Row: { user_id: string; role: AppRole; created_at: string };
        Insert: { user_id: string; role: AppRole; created_at?: string };
        Update: { user_id?: string; role?: AppRole };
        Relationships: NoRelationships;
      };
      teachers: {
        Row: {
          profile_id: string;
          display_name: string;
          avatar_url: string | null;
          governorate_id: number | null;
          city_id: number | null;
          bio: string;
          years_experience: number;
          grade_levels: string[];
          teaching_method: TeachingMethod;
          education_system: EducationSystem | null;
          available_times: string;
          phone: string | null;
          whatsapp: string | null;
          is_published: boolean;
          is_founder: boolean;
          avg_rating: number;
          ratings_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          display_name?: string;
          avatar_url?: string | null;
          governorate_id?: number | null;
          city_id?: number | null;
          bio?: string;
          years_experience?: number;
          grade_levels?: string[];
          teaching_method?: TeachingMethod;
          education_system?: EducationSystem | null;
          available_times?: string;
          phone?: string | null;
          whatsapp?: string | null;
          is_published?: boolean;
          is_founder?: boolean;
        };
        Update: {
          bio?: string;
          years_experience?: number;
          grade_levels?: string[];
          teaching_method?: TeachingMethod;
          education_system?: EducationSystem | null;
          available_times?: string;
          whatsapp?: string | null;
          is_published?: boolean;
          is_founder?: boolean;
        };
        Relationships: NoRelationships;
      };
      teacher_subjects: {
        Row: { teacher_id: string; subject_id: number };
        Insert: { teacher_id: string; subject_id: number };
        Update: { teacher_id?: string; subject_id?: number };
        Relationships: NoRelationships;
      };
      ratings: {
        Row: {
          id: number;
          teacher_id: string;
          user_id: string;
          stars: number;
          created_at: string;
          updated_at: string;
        };
        Insert: { teacher_id: string; user_id: string; stars: number };
        Update: { stars?: number };
        Relationships: NoRelationships;
      };
      reviews: {
        Row: {
          id: number;
          rating_id: number;
          teacher_id: string;
          user_id: string;
          author_name: string;
          author_avatar_url: string | null;
          comment: string;
          created_at: string;
        };
        Insert: { rating_id: number; teacher_id?: string; user_id: string; comment: string };
        Update: { comment?: string };
        Relationships: NoRelationships;
      };
      support_messages: {
        Row: {
          id: number;
          user_id: string;
          full_name: string;
          email: string;
          category: SupportCategory;
          related_teacher_id: string | null;
          message: string;
          status: SupportStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          email: string;
          category?: SupportCategory;
          related_teacher_id?: string | null;
          message: string;
        };
        Update: {
          status?: SupportStatus;
        };
        Relationships: NoRelationships;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_public_stats: {
        Args: Record<string, never>;
        Returns: { published_teachers: number; total_reviews: number }[];
      };
    };
  };
}

export type Governorate = Database["public"]["Tables"]["governorates"]["Row"];
export type City = Database["public"]["Tables"]["cities"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Teacher = Database["public"]["Tables"]["teachers"]["Row"];
export type Rating = Database["public"]["Tables"]["ratings"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type SupportMessage = Database["public"]["Tables"]["support_messages"]["Row"];

/** A published (or own/admin-visible) teacher, ready for card/profile display. */
export interface TeacherWithProfile extends Teacher {
  subjects: Pick<Subject, "id" | "name">[];
  governorate_name?: string;
  city_name?: string;
}

export interface ReviewWithAuthor extends Review {
  stars: number;
}

/** Row shape returned by getAllUsersForAdmin(). */
export interface AdminUserRow extends Profile {
  governorate_name?: string;
  city_name?: string;
}

/** Row shape returned by getAllTeachersForAdmin(). */
export interface AdminTeacherRow extends Teacher {
  email: string;
  subjects: Pick<Subject, "id" | "name">[];
  governorate_name?: string;
  city_name?: string;
}

/** Row shape returned by getAllReviewsForAdmin(). */
export interface AdminReviewRow extends Review {
  stars: number;
  teacher_name: string;
}
