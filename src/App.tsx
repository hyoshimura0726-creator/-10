import { useState, useEffect } from 'react';
import { RecipeList } from './components/RecipeList';
import { RecipeDetail } from './components/RecipeDetail';
import { RecipeForm } from './components/RecipeForm';
import { AuthScreen } from './components/AuthScreen';
import { Recipe } from './types';
import { ChefHat, LogOut } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, orderBy } from 'firebase/firestore';

type ViewState = 'list' | 'detail' | 'form';

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [view, setView] = useState<ViewState>('list');
  const [currentRecipeId, setCurrentRecipeId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loadingText, setLoadingText] = useState<string | null>('読み込み中...');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setLoadingText(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      return;
    }

    setLoadingText('レシピを読み込み中...');
    const q = query(
      collection(db, 'recipes'),
      where('ownerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recipesData: Recipe[] = [];
      snapshot.forEach((doc) => {
        recipesData.push(doc.data() as Recipe);
      });
      // Sort manually as complex queries might require composite index
      recipesData.sort((a, b) => b.createdAt - a.createdAt);
      setRecipes(recipesData);
      setLoadingText(null);
    }, (error) => {
      console.error('Error fetching recipes:', error);
      if (error instanceof Error && error.message.includes('permission_denied')) {
        console.error("Firestore Error: Missing or insufficient permissions. Have you deployed the firestore rules?");
      }
      setLoadingText(null);
    });

    return () => unsubscribe();
  }, [user]);

  if (loadingText) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
          <p className="text-[#8C6D45] font-medium">{loadingText}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const currentRecipe = currentRecipeId ? recipes.find(r => r.id === currentRecipeId) : undefined;

  const navigateToList = () => {
    setView('list');
    setCurrentRecipeId(null);
    window.scrollTo(0, 0);
  };

  const handleViewDetail = (id: string) => {
    setCurrentRecipeId(id);
    setView('detail');
    window.scrollTo(0, 0);
  };

  const handleAddNew = () => {
    setCurrentRecipeId(null);
    setView('form');
    window.scrollTo(0, 0);
  };

  const handleEdit = (id: string) => {
    setCurrentRecipeId(id);
    setView('form');
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recipes', id));
      navigateToList();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('削除に失敗しました。');
    }
  };

  const handleSave = async (savedRecipe: Recipe) => {
    try {
      const recipeToSave = { ...savedRecipe, ownerId: user.uid };
      await setDoc(doc(db, 'recipes', savedRecipe.id), recipeToSave);
      
      setCurrentRecipeId(savedRecipe.id);
      setView('detail');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('保存に失敗しました。');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#4B2E2E] pb-safe">
      {view === 'list' && (
        <header className="bg-white/50 backdrop-blur-sm border-b border-[#E6D5BC] sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">R</div>
              <h1 className="text-xl font-bold tracking-tight text-[#2D1B1B]">
                My Recipe Book
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#8C6D45] hover:bg-[#FDF8F1] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </header>
      )}

      <main>
        {view === 'list' && (
          <RecipeList
            recipes={recipes}
            onViewDetail={handleViewDetail}
            onAddNew={handleAddNew}
          />
        )}
        
        {view === 'detail' && currentRecipe && (
          <RecipeDetail
            recipe={currentRecipe}
            onBack={navigateToList}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        
        {view === 'form' && (
          <RecipeForm
            initialData={currentRecipe}
            onSave={handleSave}
            onCancel={currentRecipeId ? () => setView('detail') : navigateToList}
          />
        )}
      </main>
    </div>
  );
}
