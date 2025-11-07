'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, HelpCircle, ChevronDown, ChevronUp, 
  MessageCircle, Mail, ExternalLink, Book, Lightbulb
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: 'كيف أبدأ في كسب العملات؟',
    answer: 'يمكنك كسب العملات بعدة طرق:\n1. إكمال المهام اليومية\n2. لعب الألعاب (Lucky Wheel, Target Hit, Quiz)\n3. دعوة الأصدقاء\n4. المكافأة اليومية\n5. فتح الإنجازات',
    category: 'البداية'
  },
  {
    question: 'كيف أحصل على المكافأة اليومية؟',
    answer: 'اذهب إلى صفحة "المكافآت" واضغط على "احصل على مكافأتك اليومية". المكافأة تبدأ من 500 عملة وتزيد كل يوم تحافظ على سلسلة الأيام (streak). يمكنك الحصول على حتى 1000 عملة يومياً!',
    category: 'المكافآت'
  },
  {
    question: 'ما هي سلسلة الأيام (Streak)؟',
    answer: 'سلسلة الأيام هي عدد الأيام المتتالية التي حصلت فيها على المكافأة اليومية. كل يوم إضافي يزيد مكافأتك بـ 50 عملة. إذا فاتك يوم، تبدأ السلسلة من جديد.',
    category: 'المكافآت'
  },
  {
    question: 'كم مرة يمكنني اللعب يومياً؟',
    answer: '• Lucky Wheel: 5 مرات يومياً\n• Target Hit: 10 مرات يومياً\n• Quiz Challenge: 10 مرات يومياً\n\nتتجدد المحاولات كل 24 ساعة.',
    category: 'الألعاب'
  },
  {
    question: 'كيف أدعو أصدقائي؟',
    answer: 'اذهب إلى صفحة "الإحالات" وستجد رابط الدعوة الخاص بك. شاركه مع أصدقائك. عندما ينضم صديق باستخدام رابطك، تحصل أنت وصديقك على مكافأة!',
    category: 'الإحالات'
  },
  {
    question: 'كم أكسب من دعوة صديق؟',
    answer: 'تكسب 500 عملة لكل صديق ينضم عبر رابطك. وصديقك يحصل على 2000 عملة كمكافأة ترحيبية!',
    category: 'الإحالات'
  },
  {
    question: 'ما هي الإنجازات؟',
    answer: 'الإنجازات هي أهداف يمكنك تحقيقها للحصول على مكافآت إضافية. مثل إكمال 10 مهام، أو جمع 10,000 عملة، أو دعوة 20 صديقاً. كل إنجاز له مكافأة خاصة!',
    category: 'الإنجازات'
  },
  {
    question: 'كيف أسحب أرباحي؟',
    answer: 'اذهب إلى صفحة "المحفظة" واضغط على "سحب". اختر طريقة الدفع وأدخل التفاصيل. ستتم مراجعة طلبك خلال 24-48 ساعة.',
    category: 'السحب'
  },
  {
    question: 'ما هو الحد الأدنى للسحب؟',
    answer: 'الحد الأدنى للسحب هو 10,000 عملة.',
    category: 'السحب'
  },
  {
    question: 'كم يستغرق معالجة طلب السحب؟',
    answer: 'عادة ما يتم معالجة طلبات السحب خلال 24-48 ساعة عمل. ستصلك إشعار عند الموافقة على طلبك.',
    category: 'السحب'
  },
  {
    question: 'هل البوت مجاني؟',
    answer: 'نعم! البوت مجاني 100% ولا يوجد أي رسوم مخفية. يمكنك كسب العملات وسحبها مجاناً.',
    category: 'عام'
  },
  {
    question: 'كيف أرفع مستواي (Level)؟',
    answer: 'مستواك يرتفع تلقائياً بناءً على نشاطك. أكمل المهام، العب الألعاب، وادعُ الأصدقاء لرفع مستواك والحصول على مزايا إضافية.',
    category: 'عام'
  },
  {
    question: 'ماذا لو نسيت كلمة المرور؟',
    answer: 'لا توجد كلمة مرور! حسابك مرتبط بحساب Telegram الخاص بك تلقائياً. فقط افتح البوت من Telegram وستدخل تلقائياً.',
    category: 'الحساب'
  },
  {
    question: 'كيف أغير اللغة؟',
    answer: 'اذهب إلى صفحة "الإعدادات" ويمكنك تغيير اللغة من هناك. حالياً ندعم العربية والإنجليزية.',
    category: 'الإعدادات'
  },
  {
    question: 'هل يمكنني استخدام البوت على أكثر من جهاز؟',
    answer: 'نعم! حسابك مرتبط بحساب Telegram. يمكنك فتح البوت من أي جهاز وستجد نفس البيانات.',
    category: 'عام'
  }
];

const categories = [...new Set(faqs.map(faq => faq.category))];

export default function HelpPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFaqs = selectedCategory === 'الكل' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link href="/mini-app">
            <Button variant="ghost" size="icon" className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">❓ المساعدة</h1>
            <p className="text-sm text-purple-300">الأسئلة الشائعة والدعم</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-blue-600 to-cyan-600 border-0">
            <div className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-bold">دردشة مباشرة</p>
              <p className="text-xs opacity-80 mt-1">قريباً</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0">
            <div className="p-4 text-center">
              <Mail className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-bold">راسلنا</p>
              <p className="text-xs opacity-80 mt-1">support@bot.com</p>
            </div>
          </Card>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <Button
            onClick={() => setSelectedCategory('الكل')}
            variant={selectedCategory === 'الكل' ? 'default' : 'ghost'}
            className={`whitespace-nowrap ${
              selectedCategory === 'الكل' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                : ''
            }`}
            size="sm"
          >
            الكل ({faqs.length})
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              className={`whitespace-nowrap ${
                selectedCategory === category 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                  : ''
              }`}
              size="sm"
            >
              {category} ({faqs.filter(f => f.category === category).length})
            </Button>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <Card key={index} className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
              <button
                onClick={() => toggleExpanded(index)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <HelpCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="font-bold">{faq.question}</p>
                    <span className="text-xs text-purple-300 mt-1 inline-block">
                      {faq.category}
                    </span>
                  </div>
                </div>
                {expandedIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              {expandedIndex === index && (
                <div className="px-4 pb-4 pt-0">
                  <div className="pl-8 text-gray-300 text-sm whitespace-pre-line border-l-2 border-purple-500/50 ml-2">
                    {faq.answer}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Additional Help */}
        <Card className="mt-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50">
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-2">هل تحتاج مزيد من المساعدة؟</h3>
                <p className="text-sm text-gray-300 mb-4">
                  إذا لم تجد إجابة لسؤالك، يمكنك:
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    التواصل مع فريق الدعم
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    قراءة التوثيق الكامل
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    الانضمام لقناتنا على Telegram
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-white/10 hover:bg-white/20">
                <MessageCircle className="w-4 h-4 mr-2" />
                راسلنا
              </Button>
              <Button className="flex-1 bg-white/10 hover:bg-white/20">
                <ExternalLink className="w-4 h-4 mr-2" />
                التوثيق
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
