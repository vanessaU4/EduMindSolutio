import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CategorySelector from '@/components/Content/CategorySelector';
import { 
  CONTENT_CATEGORIES, 
  AUDIO_TYPE_OPTIONS, 
  RESOURCE_TYPE_OPTIONS, 
  COST_LEVEL_OPTIONS,
  DIFFICULTY_LEVEL_OPTIONS,
  getCategoryName,
  getActiveCategories 
} from '@/constants/categories';

const CategoryExample: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Hardcoded Categories Example</h1>
        <p className="text-gray-600">
          This page demonstrates how categories are now handled with hardcoded values instead of database models.
        </p>
      </div>

      {/* Category Selector */}
      <CategorySelector 
        selectedCategoryId={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Category Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CONTENT_CATEGORIES.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveCategories().length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Audio Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{AUDIO_TYPE_OPTIONS.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resource Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{RESOURCE_TYPE_OPTIONS.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Options Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Audio Type Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AUDIO_TYPE_OPTIONS.map((option) => (
                <Badge key={option.value} variant="outline">
                  {option.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_LEVEL_OPTIONS.map((option) => (
                <Badge key={option.value} variant="outline">
                  {option.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {RESOURCE_TYPE_OPTIONS.map((option) => (
                <Badge key={option.value} variant="outline">
                  {option.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COST_LEVEL_OPTIONS.map((option) => (
                <Badge key={option.value} variant="outline">
                  {option.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Example */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">How to use hardcoded categories:</h3>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
{`import { 
  CONTENT_CATEGORIES, 
  getCategoryById, 
  getCategoryName,
  getActiveCategories 
} from '@/constants/categories';

// Get all categories
const allCategories = CONTENT_CATEGORIES;

// Get only active categories
const activeCategories = getActiveCategories();

// Get category by ID
const category = getCategoryById(1);

// Get category name by ID
const categoryName = getCategoryName(1);`}
              </pre>
            </div>
          </div>

          {selectedCategory && (
            <div>
              <h3 className="font-medium mb-2">Selected Category Details:</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>ID:</strong> {selectedCategory}</div>
                  <div><strong>Name:</strong> {getCategoryName(selectedCategory)}</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Benefits of Hardcoded Categories:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>No database queries needed for category data</li>
              <li>Faster page loads and better performance</li>
              <li>Categories are version-controlled with the code</li>
              <li>Easier to manage and maintain</li>
              <li>No need for admin interface to manage categories</li>
              <li>Consistent across all environments</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryExample;
