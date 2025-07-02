import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ArrowLeftRight, TrendingUp } from 'lucide-react';
import Lottie from 'lottie-react';

const Home: React.FC = () => {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    fetch('/Animation - 1750959188209.json')
      .then(res => res.json())
      .then(data => setAnimationData(data));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-100 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-3xl w-full text-center bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl p-10 border border-blue-100 dark:border-gray-800">
        <div className="flex justify-center mb-8">
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={true}
              className="w-64 h-64"
            />
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary-800 dark:text-primary-300 mb-8 leading-tight">
          Controle suas <span className="text-primary-500 dark:text-primary-400">finanças</span>
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-200 mb-8 max-w-2xl mx-auto">
          O <b>Gestor Financeiro Pessoal</b> é a solução ideal para organizar contas, registrar transações, realizar transferências e acompanhar o crescimento do seu dinheiro. Tudo em um só lugar, com segurança e praticidade.
        </p>
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          <div className="flex flex-col items-center">
            <DollarSign className="text-green-500 dark:text-green-400 w-16 h-16 mb-2" />
            <span className="text-gray-600 dark:text-gray-300 text-sm">Contas e Saldos</span>
          </div>
          <div className="flex flex-col items-center">
            <ArrowLeftRight className="text-blue-500 dark:text-blue-400 w-16 h-16 mb-2" />
            <span className="text-gray-600 dark:text-gray-300 text-sm">Transações</span>
          </div>
          <div className="flex flex-col items-center">
            <TrendingUp className="text-purple-500 dark:text-purple-400 w-16 h-16 mb-2" />
            <span className="text-gray-600 dark:text-gray-300 text-sm">Relatórios e Crescimento</span>
          </div>
        </div>
        <Link
          to="/dashboard"
          className="inline-block bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white text-lg font-semibold px-10 py-4 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
        >
          Acessar o Sistema
        </Link>
      </div>
    </div>
  );
};

export default Home; 