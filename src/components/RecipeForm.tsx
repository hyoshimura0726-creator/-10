import React, { useState } from 'react';
import { Recipe, Category, Ingredient, Step, Nutrition } from '../types';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Image as ImageIcon, Sparkles, Loader2, Tag, X, Activity, Wand2, ArrowLeftRight } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Reorder } from 'motion/react';

interface Props {
  initialData?: Recipe;
  onSave: (recipe: Recipe) => void;
  onCancel: () => void;
}

export function RecipeForm({ initialData, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [category, setCategory] = useState<Category>(initialData?.category || '主菜');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialData?.ingredients?.length ? initialData.ingredients : [{ id: crypto.randomUUID(), name: '', amount: '' }]
  );
  
  const [steps, setSteps] = useState<Step[]>(
    initialData?.steps?.length ? initialData.steps : [{ id: crypto.randomUUID(), description: '' }]
  );
  
  const [tips, setTips] = useState(initialData?.tips || '');
  const [isTipsPublic, setIsTipsPublic] = useState(initialData?.isTipsPublic ?? false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [nutrition, setNutrition] = useState<Nutrition | undefined>(initialData?.nutrition);
  const [isGeneratingNutrition, setIsGeneratingNutrition] = useState(false);
  const [isGeneratingTip, setIsGeneratingTip] = useState(false);

  const categories: Category[] = ['主菜', '副菜', '汁物', '主食', 'スイーツ', 'その他'];

  const handleConvertUnit = (index: number) => {
    const ingredient = ingredients[index];
    if (!ingredient || !ingredient.amount) return;

    const amountStr = ingredient.amount.trim();
    // match number + optional space + supported unit
    const match = amountStr.match(/^([\d.,]+)\s*(g|oz|ml|cc|cup|cups|カップ|大さじ|小さじ|fl\s*oz|floz|グラム|リットル|l)$/i);
    if (!match) return;

    let num = parseFloat(match[1].replace(',', ''));
    if (isNaN(num)) return;

    let unit = match[2].toLowerCase().replace(/\s/g, '');
    let newNum = num;
    let newUnit = unit;

    switch (unit) {
      case 'g':
      case 'グラム':
        newNum = num / 200; // rough approximation to 1 cup volume
        newUnit = 'カップ';
        break;
      case 'cup':
      case 'cups':
      case 'カップ':
        newNum = num * 200; // back to g
        newUnit = 'g';
        break;
      case 'ml':
      case 'cc':
        newNum = num / 29.5735;
        newUnit = 'oz';
        break;
      case 'oz':
      case 'floz':
        newNum = num * 29.5735;
        newUnit = 'ml';
        break;
      case '大さじ':
        newNum = num * 15;
        newUnit = 'ml';
        break;
      case '小さじ':
        newNum = num * 5;
        newUnit = 'ml';
        break;
      case 'l':
      case 'リットル':
        newNum = num * 1000;
        newUnit = 'ml';
        break;
      default:
        return;
    }

    newNum = Math.round(newNum * 10) / 10;
    const newIngredients = [...ingredients];
    newIngredients[index].amount = `${newNum}${newUnit}`;
    setIngredients(newIngredients);
  };

  const handleGenerateTip = async () => {
    const validIngredients = ingredients.filter(i => i.name.trim());
    if (!title.trim() || validIngredients.length === 0) {
      alert('レシピ名と材料を入力してからお試しください。');
      return;
    }

    setIsGeneratingTip(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key is missing');

      const ai = new GoogleGenAI({ apiKey });
      const ingredientsList = validIngredients.map(i => `${i.name} ${i.amount}`).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a creative and helpful secret tip or pro-tip for a recipe titled '${title}' with ingredients: '${ingredientsList}'. The tip should be 1-2 sentences long.`,
      });

      if (response.text) {
        setTips(response.text);
      }
    } catch (error) {
      console.error('Tip generation error:', error);
      alert('コツ・ポイントの生成に失敗しました。');
    } finally {
      setIsGeneratingTip(false);
    }
  };

  const handleGenerateNutrition = async () => {
    const validIngredients = ingredients.filter(i => i.name.trim());
    if (validIngredients.length === 0) {
      alert('材料を入力してから栄養素計算をお試しください。');
      return;
    }

    setIsGeneratingNutrition(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key is missing');

      const ai = new GoogleGenAI({ apiKey });
      const ingredientsList = validIngredients.map(i => `${i.name} ${i.amount}`).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Estimate the total nutritional values for a recipe with the following ingredients: ${ingredientsList}. Return a JSON object with 'calories' (kcal), 'protein' (g), 'carbs' (g), and 'fat' (g) representing the estimated total for 1 serving. Numbers only.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.INTEGER },
              protein: { type: Type.INTEGER },
              carbs: { type: Type.INTEGER },
              fat: { type: Type.INTEGER }
            },
            required: ["calories", "protein", "carbs", "fat"]
          } as any
        }
      });

      const text = response.text;
      if (text) {
        const data = JSON.parse(text);
        setNutrition({
          calories: Number(data.calories) || 0,
          protein: Number(data.protein) || 0,
          carbs: Number(data.carbs) || 0,
          fat: Number(data.fat) || 0,
        });
      }
    } catch (error) {
      console.error('Nutrition generation error:', error);
      alert('栄養素の計算に失敗しました。');
    } finally {
      setIsGeneratingNutrition(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!title.trim()) {
      alert('レシピ名を入力してから画像生成をお試しください。');
      return;
    }

    setIsGeneratingImage(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key is missing');

      const ai = new GoogleGenAI({ apiKey });
      const ingredientsList = ingredients.map(i => i.name).filter(Boolean).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `A delicious professional food photography shot of ${title}. Main ingredients: ${ingredientsList}. Studio lighting, appetizing, high resolution food photography, warm and inviting atmosphere.` },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const generatedUrl = `data:image/png;base64,${part.inlineData.data}`;
          setImageUrl(generatedUrl);
          break;
        }
      }
    } catch (error) {
      console.error('Image generation error:', error);
      alert('画像の生成に失敗しました。');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    
    // Filter out completely empty ingredients and steps before saving
    const cleanedIngredients = ingredients.filter(i => i.name.trim() || i.amount.trim());
    const cleanedSteps = steps.filter(s => s.description.trim());

    const recipe: Recipe = {
      id: initialData?.id || crypto.randomUUID(),
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      category,
      tags,
      ingredients: cleanedIngredients,
      steps: cleanedSteps,
      tips: tips.trim(),
      isTipsPublic,
      nutrition,
      createdAt: initialData?.createdAt || Date.now(),
    };

    onSave(recipe);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { id: crypto.randomUUID(), name: '', amount: '' }]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(ingredients.filter(i => i.id !== id));
  };

  const updateIngredient = (id: string, field: 'name' | 'amount', value: string) => {
    setIngredients(ingredients.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const addStep = () => {
    setSteps([...steps, { id: crypto.randomUUID(), description: '' }]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id: string, description: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, description } : s));
  };

  return (
    <div className="max-w-3xl mx-auto bg-[#FAF7F2] min-h-screen pb-24 text-[#4B2E2E]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#E6D5BC] flex items-center justify-between px-4 py-4 shadow-sm">
        <button
          onClick={onCancel}
          className="p-2 border border-[#E6D5BC] rounded-lg text-[#8C6D45] hover:bg-[#FDF8F1] transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg text-[#2D1B1B]">
          {initialData ? 'レシピを編集' : '新しいレシピ'}
        </h1>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-orange-200 active:scale-95 transition-all focus:outline-none"
        >
          <Save className="w-5 h-5" />
          <span className="hidden sm:inline">保存</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-8">
        
        {/* Basic Info */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E6D5BC] space-y-5">
          <div>
            <label className="block text-sm font-bold text-[#A68B6A] mb-2 uppercase tracking-wide">レシピ名 <span className="text-orange-500">*</span></label>
            <input
              type="text"
              className="w-full px-4 py-3 sm:py-4 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 font-bold text-lg text-[#4B2E2E] placeholder:opacity-40 placeholder:text-[#A68B6A]"
              placeholder="究極の肉じゃが"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#A68B6A] mb-2 uppercase tracking-wide">カテゴリー</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    category === cat
                      ? 'bg-[#F5E6D3] text-[#4B2E2E] border border-[#E6D5BC]'
                      : 'bg-white text-[#A68B6A] border border-[#E6D5BC] hover:bg-[#FDF8F1]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#A68B6A] mb-2 uppercase tracking-wide">タグ</label>
            <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-orange-200">
              <Tag className="w-5 h-5 text-[#A68B6A]" />
              <div className="flex-1 flex flex-wrap gap-2 items-center">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-white border border-[#E6D5BC] px-2 py-1 rounded text-sm text-[#8C6D45]">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-[#A68B6A] hover:text-red-500 focus:outline-none">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="flex-1 min-w-[100px] bg-transparent outline-none text-[#4B2E2E] placeholder:text-[#A68B6A] placeholder:opacity-40 font-medium"
                  placeholder="タグを入力 (Enterで追加)"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  onBlur={() => {
                    const newTag = tagInput.trim().replace(/^#/, '');
                    if (newTag && !tags.includes(newTag)) {
                      setTags([...tags, newTag]);
                    }
                    setTagInput('');
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#A68B6A] mb-2 uppercase tracking-wide">写真URL（任意）</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ImageIcon className="h-5 w-5 text-[#A68B6A]" />
                </div>
                <input
                  type="url"
                  className="w-full pl-11 pr-4 py-3 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#4B2E2E] placeholder:opacity-40 placeholder:text-[#A68B6A]"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !title}
                className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all shadow-sm ${
                  isGeneratingImage || !title
                    ? 'bg-[#E6D5BC] text-[#FAF7F2] cursor-not-allowed opacity-70'
                    : 'bg-white border border-[#E6D5BC] text-[#8C6D45] hover:bg-[#FDF8F1] active:scale-95'
                }`}
              >
                {isGeneratingImage ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> <span className="hidden sm:inline">生成中...</span></>
                ) : (
                  <><Sparkles className="w-5 h-5 text-orange-400" /> <span className="hidden sm:inline">AI写真生成</span></>
                )}
              </button>
            </div>
            {imageUrl && (
              <div className="mt-4 relative aspect-video w-full sm:w-2/3 rounded-xl overflow-hidden bg-[#EEE3D3] border border-[#E6D5BC]">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>
        </section>

        {/* Ingredients */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E6D5BC]">
          <p className="text-sm uppercase tracking-widest text-[#A68B6A] font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-orange-400 block"></span> 材料
          </p>
          <Reorder.Group axis="y" values={ingredients} onReorder={setIngredients} className="space-y-3">
            {ingredients.map((ing) => (
              <Reorder.Item key={ing.id} value={ing} className="flex items-center gap-2 bg-white">
                <div className="text-[#E6D5BC] px-1 hover:text-[#A68B6A] cursor-grab active:cursor-grabbing transition-colors drag-handle">
                  <GripVertical className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="食材"
                  className="flex-1 px-4 py-3 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#4B2E2E] placeholder:opacity-40 placeholder:text-[#A68B6A]"
                  value={ing.name}
                  onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                />
                <div className="relative w-36 sm:w-44 flex items-center shrink-0">
                  <input
                    type="text"
                    placeholder="分量"
                    className="w-full pl-3 pr-10 py-3 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#4B2E2E] placeholder:opacity-40 placeholder:text-[#A68B6A]"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(ing.id, 'amount', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleConvertUnit(ingredients.indexOf(ing))}
                    title="単位を変換 (g ↔ カップ, ml ↔ oz 等)"
                    className="absolute right-2 p-1.5 text-[#A68B6A] hover:text-orange-600 rounded bg-white border border-[#E6D5BC] hover:bg-[#FDF8F1] transition-all shadow-sm active:scale-95"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => removeIngredient(ing.id)}
                  className="p-3 text-[#A68B6A] hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <button
            onClick={addIngredient}
            className="mt-4 flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 px-4 py-2 rounded-xl border border-transparent hover:border-orange-200 hover:bg-[#FFF9F0] transition-colors"
          >
            <Plus className="w-5 h-5" />
            材料を追加
          </button>
        </section>

        {/* Nutrition */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E6D5BC]">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm uppercase tracking-widest text-[#A68B6A] font-semibold flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-400 block"></span> 栄養情報（1人分目安）
            </p>
            <button
              type="button"
              onClick={handleGenerateNutrition}
              disabled={isGeneratingNutrition}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isGeneratingNutrition
                  ? 'bg-[#E6D5BC] text-[#FAF7F2] cursor-not-allowed opacity-70'
                  : 'bg-white border border-[#E6D5BC] text-orange-600 hover:bg-[#FDF8F1] active:scale-95'
              }`}
            >
              {isGeneratingNutrition ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 計算中...</>
              ) : (
                <><Activity className="w-3.5 h-3.5" /> AIで自動計算</>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#A68B6A] mb-1">カロリー (kcal)</label>
              <input
                type="number"
                disabled={isGeneratingNutrition}
                value={nutrition?.calories || ''}
                onChange={(e) => setNutrition({ ...nutrition, calories: Number(e.target.value) } as Nutrition)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#4B2E2E] font-mono text-center disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#A68B6A] mb-1">タンパク質 (g)</label>
              <input
                type="number"
                disabled={isGeneratingNutrition}
                value={nutrition?.protein || ''}
                onChange={(e) => setNutrition({ ...nutrition, protein: Number(e.target.value) } as Nutrition)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#4B2E2E] font-mono text-center disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#A68B6A] mb-1">脂質 (g)</label>
              <input
                type="number"
                disabled={isGeneratingNutrition}
                value={nutrition?.fat || ''}
                onChange={(e) => setNutrition({ ...nutrition, fat: Number(e.target.value) } as Nutrition)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#4B2E2E] font-mono text-center disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#A68B6A] mb-1">炭水化物 (g)</label>
              <input
                type="number"
                disabled={isGeneratingNutrition}
                value={nutrition?.carbs || ''}
                onChange={(e) => setNutrition({ ...nutrition, carbs: Number(e.target.value) } as Nutrition)}
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#4B2E2E] font-mono text-center disabled:opacity-50"
              />
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E6D5BC]">
          <p className="text-sm uppercase tracking-widest text-[#A68B6A] font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-orange-400 block"></span> 作り方
          </p>
          <Reorder.Group axis="y" values={steps} onReorder={setSteps} className="space-y-4">
            {steps.map((step, idx) => (
              <Reorder.Item key={step.id} value={step} className="flex gap-3 items-start bg-white">
                <div className="mt-2 text-[#E6D5BC] px-1 hover:text-[#A68B6A] cursor-grab active:cursor-grabbing transition-colors drag-handle">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="mt-2 font-serif text-xl italic font-black text-orange-300 flex-shrink-0 w-6 text-center select-none">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    placeholder="手順を入力..."
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E6D5BC] rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#4B2E2E] text-lg resize-none placeholder:opacity-40 placeholder:text-[#A68B6A]"
                    value={step.description}
                    onChange={(e) => updateStep(step.id, e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removeStep(step.id)}
                  className="p-3 mt-1 text-[#A68B6A] hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <button
            onClick={addStep}
            className="mt-4 flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 px-4 py-2 rounded-xl border border-transparent hover:border-orange-200 hover:bg-[#FFF9F0] transition-colors"
          >
            <Plus className="w-5 h-5" />
            手順を追加
          </button>
        </section>

        {/* Tips */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-[#E6D5BC]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm font-bold text-orange-800">✨ 自分だけのコツ・黄金比</p>
              <button
                type="button"
                onClick={handleGenerateTip}
                disabled={ingredients.filter(i => i.name.trim()).length === 0 || !title.trim() || isGeneratingTip}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 ${
                  isGeneratingTip || !title.trim() || ingredients.filter(i => i.name.trim()).length === 0
                    ? 'bg-[#E6D5BC] text-[#FAF7F2] cursor-not-allowed opacity-70'
                    : 'bg-white border border-[#E6D5BC] text-orange-600 hover:bg-[#FDF8F1] active:scale-95'
                }`}
              >
                {isGeneratingTip ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 生成中...</>
                ) : (
                  <><Wand2 className="w-3.5 h-3.5" /> AIで生成</>
                )}
              </button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-[#FAF7F2] px-3 py-2 rounded-xl border border-[#E6D5BC] shadow-sm shrink-0 w-fit">
              <input
                type="checkbox"
                className="w-4 h-4 text-orange-600 border-[#E6D5BC] rounded focus:ring-orange-500"
                checked={isTipsPublic}
                onChange={(e) => setIsTipsPublic(e.target.checked)}
              />
              <span className="text-sm font-bold text-[#A68B6A] select-none">公開する</span>
            </label>
          </div>
          <textarea
            rows={4}
            placeholder="秘密の調味料の割合や、失敗しないコツなどをメモしておきましょう！"
            className="w-full px-5 py-4 bg-[#FFF9F0] border border-orange-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-200 text-[#5C4033] text-lg resize-none placeholder-amber-200 italic font-medium"
            value={tips}
            onChange={(e) => setTips(e.target.value)}
          />
        </section>
        
      </div>
    </div>
  );
}
