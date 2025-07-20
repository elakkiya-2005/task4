import React, { useState, useCallback } from 'react';
import { MessageSquare, BarChart3, TrendingUp, Users, Loader2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import SentimentChart from './components/SentimentChart';
import TrendChart from './components/TrendChart';
import BrandAnalysis from './components/BrandAnalysis';
import MetricsCard from './components/MetricsCard';
import DataTable from './components/DataTable';
import { SocialMediaPost, AnalyticsData } from './types';
import { parseCSVData, generateAnalytics, generateSampleData } from './utils/dataProcessor';

function App() {
  const [data, setData] = useState<SocialMediaPost[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processData = useCallback((posts: SocialMediaPost[]) => {
    const analyticsData = generateAnalytics(posts);
    setData(posts);
    setAnalytics(analyticsData);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      const posts = await parseCSVData(text);
      
      if (posts.length === 0) {
        throw new Error('No valid data found in the CSV file');
      }
      
      processData(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsLoading(false);
    }
  }, [processData]);

  const handleSampleData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    try {
      const samplePosts = generateSampleData();
      processData(samplePosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate sample data');
    } finally {
      setIsLoading(false);
    }
  }, [processData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Processing your data...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Social Media Sentiment Analysis
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Analyze public opinion and understand brand perception through advanced sentiment analysis 
              of social media conversations and engagement patterns.
            </p>
          </div>
          
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          <div className="max-w-2xl mx-auto">
            <FileUpload 
              onFileSelect={handleFileSelect}
              onSampleData={handleSampleData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sentiment Analysis Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Real-time insights from {analytics.totalPosts.toLocaleString()} social media posts
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Total Posts"
            value={analytics.totalPosts.toLocaleString()}
            icon={MessageSquare}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <MetricsCard
            title="Positive Sentiment"
            value={`${((analytics.sentimentBreakdown.positive / analytics.totalPosts) * 100).toFixed(1)}%`}
            subtitle={`${analytics.sentimentBreakdown.positive} posts`}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <MetricsCard
            title="Average Score"
            value={analytics.averageScore.toFixed(3)}
            subtitle="Sentiment scale: -1 to +1"
            icon={BarChart3}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <MetricsCard
            title="Brands Mentioned"
            value={analytics.topBrands.length}
            subtitle="Active discussions"
            icon={Users}
            color="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SentimentChart data={analytics.sentimentBreakdown} />
          <TrendChart data={analytics.timeSeriesData} />
        </div>

        {/* Brand and Topic Analysis */}
        <div className="mb-8">
          <BrandAnalysis 
            brands={analytics.topBrands} 
            topics={analytics.topTopics}
          />
        </div>

        {/* Data Table */}
        <DataTable data={data} />

        {/* Reset Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => {
              setData([]);
              setAnalytics(null);
              setError(null);
            }}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Upload New Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;