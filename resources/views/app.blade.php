<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Favicons using the official Our Lady of Fatima Parish Seal --}}
        <link rel="icon" href="/images/fatima-parish-logo.png" type="image/png">
        <link rel="apple-touch-icon" href="/images/fatima-parish-logo.png">

        {{-- Global Critical Style: Guarantee 100% black typed text and visible placeholders everywhere --}}
        <style>
            html {
                background-color: #ffffff;
                color: #0f172a;
            }
            /* Universal input text color enforcement */
            input, select, textarea,
            input[type="text"], input[type="password"], input[type="email"],
            input[type="number"], input[type="search"], input[type="tel"] {
                color: #000000 !important;
                -webkit-text-fill-color: #000000 !important;
                background-color: #ffffff !important;
                caret-color: #000000 !important;
                opacity: 1 !important;
                font-weight: 500 !important;
            }
            input::placeholder, textarea::placeholder, select::placeholder {
                color: #64748b !important;
                -webkit-text-fill-color: #64748b !important;
                opacity: 1 !important;
            }
            input:-webkit-autofill,
            input:-webkit-autofill:hover, 
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active,
            textarea:-webkit-autofill,
            select:-webkit-autofill {
                -webkit-text-fill-color: #000000 !important;
                color: #000000 !important;
                -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
                box-shadow: 0 0 0px 1000px #ffffff inset !important;
            }
        </style>

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Our Lady of Fatima Parish Davao') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased bg-slate-50 text-slate-900">
        <x-inertia::app />
    </body>
</html>
