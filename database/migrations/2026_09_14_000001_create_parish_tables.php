<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('title');
            $table->string('role');
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('pin');
            $table->string('initials');
            $table->string('avatar_color')->nullable();
            $table->timestamps();
        });

        Schema::create('gkks', function (Blueprint $table) {
            $table->id();
            $table->string('zone');
            $table->string('gkk')->nullable();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('parishioners', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('member_id')->unique();
            $table->string('name');
            $table->string('pin');
            $table->string('zone');
            $table->string('gkk')->nullable();
            $table->string('ministry');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('avatar_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->date('join_date');
            $table->timestamps();
        });

        Schema::create('mass_celebrations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->string('season');
            $table->date('date');
            $table->string('time');
            $table->string('presider');
            $table->string('language');
            $table->string('type_badge');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('mass_ministry_slots', function (Blueprint $table) {
            $table->id();
            $table->string('mass_id');
            $table->string('ministry');
            $table->integer('required_count')->default(1);
            $table->timestamps();

            $table->foreign('mass_id')->references('id')->on('mass_celebrations')->onDelete('cascade');
        });

        Schema::create('mass_slot_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mass_ministry_slot_id')->constrained('mass_ministry_slots')->onDelete('cascade');
            $table->string('parishioner_id');
            $table->timestamps();

            $table->foreign('parishioner_id')->references('id')->on('parishioners')->onDelete('cascade');
        });

        Schema::create('attendance_records', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('parishioner_id');
            $table->string('parishioner_name');
            $table->string('member_id');
            $table->string('zone');
            $table->string('gkk')->nullable();
            $table->string('ministry');
            $table->string('mass_id')->nullable();
            $table->string('mass_name');
            $table->string('check_in_time');
            $table->date('date');
            $table->string('status'); // On-Time, Grace Period, Late
            $table->string('method'); // Kiosk PIN, Admin Manual
            $table->timestamps();

            $table->foreign('parishioner_id')->references('id')->on('parishioners')->onDelete('cascade');
            $table->foreign('mass_id')->references('id')->on('mass_celebrations')->nullOnDelete();
        });

        Schema::create('parish_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parish_settings');
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('mass_slot_assignments');
        Schema::dropIfExists('mass_ministry_slots');
        Schema::dropIfExists('mass_celebrations');
        Schema::dropIfExists('gkks');
        Schema::dropIfExists('parishioners');
        Schema::dropIfExists('admins');
    }
};
