<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ParishController;

// Web Views
Route::get('/', [ParishController::class, 'showLogin'])->name('home');
Route::get('/dashboard', [ParishController::class, 'showDashboard'])->name('dashboard');
Route::get('/admin', [ParishController::class, 'showDashboard'])->name('admin');
Route::get('/kiosk', [ParishController::class, 'showKiosk'])->name('parish.kiosk');

// Parish Database API Routes (Connected directly to MySQL database `churchattendace`)
Route::prefix('api/parish')->group(function () {
    Route::get('/state', [ParishController::class, 'apiState']);
    Route::post('/check-in', [ParishController::class, 'apiCheckIn']);
    Route::delete('/attendance/{id}', [ParishController::class, 'apiDeleteAttendance']);
    Route::post('/parishioners', [ParishController::class, 'apiStoreParishioner']);
    Route::put('/parishioners/{id}', [ParishController::class, 'apiUpdateParishioner']);
    Route::delete('/parishioners/{id}', [ParishController::class, 'apiDeleteParishioner']);
    Route::post('/masses', [ParishController::class, 'apiStoreMass']);
    Route::put('/masses/{id}/assignments', [ParishController::class, 'apiUpdateMassAssignments']);
    Route::post('/masses/{id}/active', [ParishController::class, 'apiSetActiveMass']);
    Route::post('/admins', [ParishController::class, 'apiStoreAdmin']);
    Route::post('/admins/{id}/switch', [ParishController::class, 'apiSwitchAdmin']);
    Route::post('/season', [ParishController::class, 'apiSetLiturgicalSeason']);
    Route::post('/reset-db', [ParishController::class, 'apiResetDatabase']);
});

require __DIR__.'/settings.php';
