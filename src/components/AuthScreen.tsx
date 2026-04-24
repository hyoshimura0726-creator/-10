import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ChefHat } from 'lucide-react';

export function AuthScreen() {
  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('ログインに失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans text-[#4B2E2E] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E6D5BC] max-w-md w-full text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-6 shadow-md shadow-orange-500/20">
          <ChefHat className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2D1B1B] mb-2">
          My Recipe Book
        </h1>
        <p className="text-sm text-[#8C6D45] mb-8">
          あなただけのレシピを保存・管理しましょう
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-white border border-[#E6D5BC] hover:bg-[#FDF8F1] text-[#8C6D45] font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Googleでログイン
        </button>
      </div>
    </div>
  );
}
