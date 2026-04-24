import { useState, useMemo } from 'react';
import { Recipe, Category } from '../types';
import { Search, Plus, Utensils, Clock, ChevronRight, ArrowUpDown } from 'lucide-react';

interface Props {
  recipes: Recipe[];
  onViewDetail: (id: string) => void;
  onAddNew: () => void;
}

export function RecipeList({ recipes, onViewDetail, onAddNew }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'すべて'>('すべて');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  type SortOption = 'newest' | 'oldest' | 'title' | 'category';
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const categories: (Category | 'すべて')[] = ['すべて', '主菜', '副菜', '汁物', '主食', 'スイーツ', 'その他'];

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    recipes.forEach(r => {
      r.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [recipes]);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      recipe.ingredients.some(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (recipe.tags && recipe.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesCategory = selectedCategory === 'すべて' || recipe.category === selectedCategory;
    const matchesTag = selectedTag ? (recipe.tags || []).includes(selectedTag) : true;

    return matchesSearch && matchesCategory && matchesTag;
  }).sort((a, b) => {
    switch (sortOption) {
      case 'newest': return b.createdAt - a.createdAt;
      case 'oldest': return a.createdAt - b.createdAt;
      case 'title': return a.title.localeCompare(b.title, 'ja');
      case 'category': return a.category.localeCompare(b.category, 'ja');
      default: return b.createdAt - a.createdAt;
    }
  });

  return (
    <div className="max-w-4xl mx-auto pb-24 lg:pb-8">
      {/* Search and Filters - sticky to stay accessible */}
      <div className="sticky top-0 z-10 bg-white/50 backdrop-blur-sm pt-6 pb-6 px-4 sm:px-6 border-b border-[#E6D5BC]">
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full bg-white border border-[#E6D5BC] rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#4B2E2E] placeholder:text-[#A68B6A] sm:text-lg transition-shadow"
            placeholder="レシピ名や食材で検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#A68B6A]" />
          </div>
        </div>
        
        {/* Categories scrollable horizontally */}
        <div className="flex overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 space-x-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-md font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#F5E6D3] text-[#4B2E2E]'
                  : 'hover:bg-[#FDF8F1] text-[#A68B6A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Options Row (Tags and Sort) */}
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Quick Tags */}
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-2 py-1 rounded text-sm transition-colors border ${
                    selectedTag === tag 
                      ? 'bg-orange-500 text-white border-orange-500' 
                      : 'bg-white border-[#E6D5BC] text-[#8C6D45] hover:bg-[#FDF8F1]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <label htmlFor="sort-select" className="text-sm font-bold text-[#A68B6A] flex items-center gap-1">
              <ArrowUpDown className="w-4 h-4" /> 並び替え
            </label>
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-white border border-[#E6D5BC] rounded-lg py-1.5 px-3 text-[#4B2E2E] text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="title">名前順</option>
              <option value="category">カテゴリー順</option>
            </select>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 mt-6">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-white border border-[#E6D5BC] shadow-sm">
            <Utensils className="mx-auto h-12 w-12 text-[#A68B6A]" />
            <h3 className="mt-4 text-lg font-medium text-[#2D1B1B]">レシピが見つかりません</h3>
            <p className="mt-1 text-[#8C6D45]">
              検索条件を変えるか、新しいレシピを登録してください。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white p-4 rounded-2xl border border-[#E6D5BC] shadow-sm hover:border-orange-400 transition-colors cursor-pointer group flex flex-col"
                onClick={() => onViewDetail(recipe.id)}
              >
                <div className="aspect-video w-full bg-[#EEE3D3] rounded-xl mb-3 overflow-hidden">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <p className="text-sm font-bold text-[#8C6D45]">{recipe.title}</p>
                      <p className="text-xs opacity-50 text-[#8C6D45] mt-1">No Image</p>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-[#2D1B1B] line-clamp-2 leading-tight mb-2">
                      {recipe.title}
                    </h3>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[#A68B6A] text-xs">
                    <span className="font-bold">{recipe.category}</span>
                    <div className="flex items-center gap-1.5">
                      {recipe.tags && recipe.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="bg-white border border-[#E6D5BC] px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap text-[#8C6D45]">#{tag}</span>
                      ))}
                      <span className="bg-[#FAF7F2] px-2 py-1 rounded border border-[#E6D5BC] ml-1">{new Date(recipe.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for mobile */}
      <div className="fixed bottom-6 right-6 z-20">
        <button
          onClick={onAddNew}
          className="bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center p-4 shadow-lg shadow-orange-200 active:scale-95 transition-transform"
          aria-label="Add new recipe"
        >
          <Plus className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
}
