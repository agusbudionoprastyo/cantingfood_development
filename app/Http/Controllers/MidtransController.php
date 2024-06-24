<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransController extends Controller
{
    public function getToken(Request $request)
    {
        // Validasi input
        $request->validate([
            'subtotal' => 'required|numeric|min:1',
            'total_tax' => 'required|numeric|min:0', // Tambahkan validasi untuk total_tax
        ]);

        // Set konfigurasi Midtrans
        Config::$serverKey = 'SB-Mid-server-tXFXDeXhTKaEXOQmyQsFN4q8';
        Config::$isProduction = false;
        Config::$isSanitized = true;
        Config::$is3ds = true;

        // Buat parameter transaksi
        $params = [
            'transaction_details' => [
                'order_id' => uniqid(),
                'gross_amount' => $request->subtotal + $request->total_tax, // Tambahkan total_tax ke gross_amount
            ],
            'customer_details' => [
                'first_name' => 'Walking',
                'last_name' => 'Customer',
                'email' => 'customer@example.com',
                'phone' => '081234567890',
            ],
        ];

        // Dapatkan token Snap
        $snapToken = Snap::getSnapToken($params);

        return response()->json(['data' => ['token' => $snapToken]]);
    }
}