import { useState } from 'react';
import { Recipe } from '../types';
import { ArrowLeft, Edit2, Trash2, Globe, Lock, ChefHat, AlertTriangle } from 'lucide-react';

interface Props {
  recipe: Recipe;
  onBack: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RecipeDetail({ recipe, onBack, onEdit, onDelete }: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(recipe.id);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white min-h-screen">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D1B1B]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-[#E6D5BC]">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-center text-[#2D1B1B] mb-2">レシピの削除</h3>
            <p className="text-center text-[#8C6D45] text-sm mb-6">
              「{recipe.title}」を削除してもよろしいですか？<br />
              この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-[#8C6D45] bg-[#FAF7F2] border border-[#E6D5BC] hover:bg-[#FDF8F1] transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-all"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-[#E6D5BC] flex items-center justify-between px-4 py-4 sm:px-8">
        <button
          onClick={onBack}
          className="p-2 border border-[#E6D5BC] rounded-lg text-[#8C6D45] hover:bg-[#FDF8F1] transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(recipe.id)}
            className="p-2 border border-[#E6D5BC] rounded-lg text-[#8C6D45] hover:bg-[#FDF8F1] transition-colors text-sm font-bold flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" /> <span className="hidden sm:inline">編集</span>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 bg-red-50 border border-red-100 text-red-500 rounded-lg hover:bg-red-100 transition-colors text-sm font-bold flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">削除</span>
          </button>
        </div>
      </div>

      {/* Image & Title */}
      <div className="px-5 sm:px-8 pt-8 pb-4">
        {recipe.imageUrl && (
          <div className="w-full aspect-video bg-[#EEE3D3] rounded-2xl overflow-hidden mb-6 border border-[#E6D5BC]">
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D1B1B] leading-tight mb-3">
          {recipe.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm font-bold text-[#8C6D45] bg-[#F5E6D3] px-2.5 py-1 rounded-full">{recipe.category}</span>
          {recipe.tags?.map(tag => (
            <span key={tag} className="text-sm text-[#8C6D45] border border-[#E6D5BC] px-2.5 py-1 rounded-full bg-white shadow-sm">
              #{tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-[#A68B6A] font-medium">
          登録日: {new Date(recipe.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Content Body */}
      <div className="px-5 sm:px-8 pb-16 space-y-10 mt-4">
        
        {/* Ingredients */}
        <section>
          <p className="text-sm uppercase tracking-widest text-[#A68B6A] font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-orange-400 block"></span> 材料
          </p>
          <ul className="space-y-2 border-l-2 border-[#FAF7F2] pl-4">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex justify-between items-center">
                <span className="text-lg text-[#4B2E2E]">{ing.name}</span>
                <span className="text-lg font-mono text-[#4B2E2E]">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Nutrition */}
        {recipe.nutrition && (
          <section>
            <p className="text-sm uppercase tracking-widest text-[#A68B6A] font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-orange-400 block"></span> 栄養情報（1人分目安）
            </p>
            <div className="grid grid-cols-4 gap-3 text-center text-[#4B2E2E]">
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6D5BC]">
                <p className="text-[10px] sm:text-xs text-[#A68B6A] mb-1 font-bold">カロリー</p>
                <p className="font-bold font-mono text-base sm:text-lg">{recipe.nutrition.calories}<span className="text-[10px] font-sans ml-0.5 opacity-70">kcal</span></p>
              </div>
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6D5BC]">
                <p className="text-[10px] sm:text-xs text-[#A68B6A] mb-1 font-bold">タンパク質</p>
                <p className="font-bold font-mono text-base sm:text-lg">{recipe.nutrition.protein}<span className="text-[10px] font-sans ml-0.5 opacity-70">g</span></p>
              </div>
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6D5BC]">
                <p className="text-[10px] sm:text-xs text-[#A68B6A] mb-1 font-bold">脂質</p>
                <p className="font-bold font-mono text-base sm:text-lg">{recipe.nutrition.fat}<span className="text-[10px] font-sans ml-0.5 opacity-70">g</span></p>
              </div>
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6D5BC]">
                <p className="text-[10px] sm:text-xs text-[#A68B6A] mb-1 font-bold">炭水化物</p>
                <p className="font-bold font-mono text-base sm:text-lg">{recipe.nutrition.carbs}<span className="text-[10px] font-sans ml-0.5 opacity-70">g</span></p>
              </div>
            </div>
          </section>
        )}

        {/* Steps */}
        <section>
          <p className="text-sm uppercase tracking-widest text-[#A68B6A] font-semibold mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-orange-400 block"></span> 作り方
          </p>
          <div className="space-y-6">
            {recipe.steps.map((step, idx) => (
              <div key={step.id} className="flex gap-4">
                <span className="text-2xl font-serif text-orange-200 font-black italic flex-shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <p className="text-lg leading-relaxed text-[#4B2E2E] pt-1">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Golden Ratio / Tips */}
        {recipe.tips && (
          <section className="p-6 bg-[#FFF9F0] rounded-2xl border border-orange-100 shadow-inner">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-bold text-orange-800 flex items-center gap-2">✨ 自分だけのコツ・黄金比</p>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] uppercase font-bold text-orange-400">
                   {recipe.isTipsPublic ? '公開中' : '非公開'}
                 </span>
                 <div className={`w-8 h-4 rounded-full relative ${recipe.isTipsPublic ? 'bg-orange-500' : 'bg-orange-200'}`}>
                   <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${recipe.isTipsPublic ? 'right-0.5' : 'left-0.5'}`}></div>
                 </div>
              </div>
            </div>
            <p className="text-lg font-medium leading-relaxed italic text-[#5C4033] whitespace-pre-wrap">
              「{recipe.tips}」
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
