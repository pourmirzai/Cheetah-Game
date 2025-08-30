CREATE TABLE "game_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"event_type" text NOT NULL,
	"event_data" jsonb,
	"timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"cubs_survived" integer DEFAULT 0 NOT NULL,
	"months_completed" integer DEFAULT 0 NOT NULL,
	"final_score" integer DEFAULT 0 NOT NULL,
	"game_time" integer DEFAULT 0 NOT NULL,
	"death_cause" text,
	"device_type" text,
	"province" text,
	"achievements" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "game_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "game_stats" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" text NOT NULL,
	"total_games" integer DEFAULT 0 NOT NULL,
	"avg_cubs_survived" numeric(3, 1) DEFAULT '0.0',
	"avg_months_completed" numeric(3, 1) DEFAULT '0.0',
	"most_common_death_cause" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "game_stats_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "leaderboard" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"player_name" text DEFAULT 'بازیکن ناشناس',
	"cubs_survived" integer NOT NULL,
	"months_completed" integer NOT NULL,
	"final_score" integer NOT NULL,
	"province" text,
	"achievement_title" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "leaderboard_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
