"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PaymentType } from '@prisma/client';

interface PaymentFiltersProps {
    onFilterChange: (filters: { paymentTypeId: string; startDate: string; endDate: string; }) => void;
}

export function PaymentFilters({ onFilterChange }: PaymentFiltersProps) {
    // ★ 修正点: 初期値を 'all' に変更
    const [paymentTypeId, setPaymentTypeId] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const { data: paymentTypes } = useSWR<PaymentType[]>('/api/payment-types', fetcher);

    const handleApplyFilters = () => {
        onFilterChange({ paymentTypeId, startDate, endDate });
    };

    return (
        <div className="flex items-center gap-2 p-4 border rounded-lg bg-muted/50">
            <Select value={paymentTypeId} onValueChange={setPaymentTypeId}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="入金タイプで絞り込み" />
                </SelectTrigger>
                <SelectContent>
                    {/* ★ 修正点: valueを "all" に変更 */}
                    <SelectItem value="all">すべてのタイプ</SelectItem>
                    {paymentTypes?.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span>〜</span>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            <Button onClick={handleApplyFilters}>絞り込み</Button>
        </div>
    );
}