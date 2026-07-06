PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_themes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`background_type` text DEFAULT 'gradient' NOT NULL,
	`background_value` text DEFAULT '#1a1a2e,#16213e' NOT NULL,
	`background_angle` text DEFAULT '160deg' NOT NULL,
	`background_image_url` text DEFAULT '' NOT NULL,
	`overlay_color` text DEFAULT '#000000' NOT NULL,
	`overlay_opacity` text DEFAULT '0' NOT NULL,
	`primary_color` text DEFAULT '#0f3460' NOT NULL,
	`secondary_color` text DEFAULT '#a78bfa' NOT NULL,
	`card_background` text DEFAULT 'rgba(255,255,255,0.06)' NOT NULL,
	`card_border_color` text DEFAULT 'rgba(167,139,250,0.16)' NOT NULL,
	`text_color` text DEFAULT '#eaeaea' NOT NULL,
	`muted_text_color` text DEFAULT 'rgba(234,234,234,0.7)' NOT NULL,
	`mode` text DEFAULT 'dark' NOT NULL,
	`font_family` text DEFAULT 'inter' NOT NULL,
	`font_scale` text DEFAULT 'md' NOT NULL,
	`font_weight` text DEFAULT '600' NOT NULL,
	`letter_spacing` text DEFAULT '0' NOT NULL,
	`link_style` text DEFAULT 'glass' NOT NULL,
	`animation_type` text DEFAULT 'lift' NOT NULL,
	`radius` text DEFAULT 'auto' NOT NULL,
	`button_size` text DEFAULT 'md' NOT NULL,
	`border_width` text DEFAULT '1px' NOT NULL,
	`shadow_strength` text DEFAULT 'medium' NOT NULL,
	`hover_effect` text DEFAULT 'lift' NOT NULL,
	`container_width` text DEFAULT 'standard' NOT NULL,
	`alignment` text DEFAULT 'center' NOT NULL,
	`density` text DEFAULT 'comfortable' NOT NULL,
	`glow` text DEFAULT 'false' NOT NULL,
	`glow_color` text DEFAULT '#a78bfa' NOT NULL,
	`blur` text DEFAULT '8px' NOT NULL,
	`noise` text DEFAULT 'false' NOT NULL,
	`is_active` integer DEFAULT false NOT NULL,
	`is_preset` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_themes`(`id`, `name`, `background_type`, `background_value`, `font_family`, `primary_color`, `text_color`, `link_style`, `animation_type`, `is_active`) SELECT `id`, `name`, `background_type`, `background_value`, `font_family`, `primary_color`, `text_color`, `link_style`, `animation_type`, `is_active` FROM `themes`;--> statement-breakpoint
DROP TABLE `themes`;--> statement-breakpoint
ALTER TABLE `__new_themes` RENAME TO `themes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;