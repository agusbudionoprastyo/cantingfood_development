<?php

use App\Enums\OrderStatus;

return [
    OrderStatus::PENDING          => 'Tertunda',
    OrderStatus::ACCEPT           => 'Dikonfirmasi',
    OrderStatus::PROCESSING       => 'Diproses',
    OrderStatus::OUT_FOR_DELIVERY => 'Dikirim',
    OrderStatus::DELIVERED        => 'Terkirim',
    OrderStatus::CANCELED         => 'Dibatalkan',
    OrderStatus::REJECTED         => 'Ditolak',
    OrderStatus::RETURNED         => 'Dikembalikan',


];
