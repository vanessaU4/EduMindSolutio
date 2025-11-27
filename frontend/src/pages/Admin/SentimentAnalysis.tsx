
import React from 'react';
import SentimentOverview from '@/components/Admin/Sentiment/SentimentOverview';
import ReviewsTable from '@/components/Admin/Sentiment/ReviewsTable';
import SentimentFilters from '@/components/Admin/Sentiment/SentimentFilters';

const AdminSentimentAnalysis = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Sentiment Analysis Dashboard</h1>
                <p className="text-muted-foreground">
                    An overview of customer sentiment across all reviews.
                </p>
            </div>
            
            <SentimentOverview />
            <SentimentFilters />
            <ReviewsTable />
        </div>
    );
};

export default AdminSentimentAnalysis;
