import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Content } from "@google/genai";
import { Bot, User, Send, Loader2, Sparkles, ArrowLeft, X, MessageSquare } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext.tsx';
import { useAdmin } from '../contexts/AdminContext.tsx';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useCreativeWritingAdmin } from '../contexts/admin/CreativeWritingAdminContext.tsx';
import { ChildProfile } from '../lib/database.types.ts';

// --- Static Data and Types ---

const productDetails = [
  {
    key: 'custom_story',
    title: 'القصة المخصصة',
    description: 'قصة فريدة تجعل طفلك بطل الحكاية، مع دمج اسمه وصورته.',
    imageUrl: 'https://i.ibb.co/P9tGk1X/product-custom-story.png',
    link: '/order/custom_story'
  },
  {
    key: 'coloring_book',
    title: 'دفتر التلوين',
    description: 'شخصيات طفلك من قصته في دفتر تلوين ممتع.',
    imageUrl: 'https://i.ibb.co/m9xG3yS/product-coloring-book.png',
    link: '/order/coloring_book'
  },
    { 
        key: 'dua_booklet', 
        title: 'كتيب الأذكار والأدعية', 
        description: 'رفيق يومي مصور لتعليم الأدعية والأذكار اليومية.',
        imageUrl: 'https://i.ibb.co/R4k5p1S/product-dua-booklet.png',
        link: '/order/dua_booklet'
    },
    { 
        key: 'gift_box', 
        title: 'بوكس الهدية', 
        description: 'المجموعة الكاملة في بوكس أنيق، أفضل هدية متكاملة.',
        imageUrl: 'https://i.ibb.co/dK5zZ7s/product-gift-box.png',
        link: '/order/gift_box'
    },
];

interface ProductSuggestion {
  key: string;
}

interface DisplayMessage {
  id: number;
  role: 'user' | 'model';
  text: string;
  productSuggestion?: ProductSuggestion;
}

const generateSystemInstruction = (prices: any, siteContent: any, creativeWritingPackages: any, childProfiles: ChildProfile[]) => {
    if (!prices || !siteContent?.about?.intro_text || !creativeWritingPackages) {
        return 'أنت مساعد ذكي لمنصة الرحلة. البيانات غير متوفرة حالياً.';
    }

    const enhaLakProducts = productDetails.map(p => 
      `- المنتج: "${p.title}" (المفتاح: ${p.key}). الوصف: ${p.description}.`
    ).join('\n');

    const cwPackages = creativeWritingPackages.map((p: any) =>
      `- الباقة: "${p.name}". السعر: ${p.price} ج.م. المحتوى: ${p.sessions}. الميزات: ${p.features.join('، ')}.`
    ).join('\n');
    
    let childrenInfo = "This user has no registered children.";
    if (childProfiles && childProfiles.length > 0) {
        childrenInfo = "Here is information about the user's children. Use this to personalize your recommendations:\n" +
        childProfiles.map(child => {
            let info = `- Name: ${child.name}, Age: ${child.age}.`;
            if (child.interests && child.interests.length > 0) {
                info += ` Interests: ${child.interests.join(', ')}.`;
            }
            if (child.strengths && child.strengths.length > 0) {
                info += ` Strengths: ${child.strengths.join(', ')}.`;
            }
            return info;
        }).join('\n');
    }

    const aboutContent = siteContent.about || {};

    return `
**Persona:**
أنت "المرشد الإبداعي"، الرفيق الذكي الدافئ والخيالي من منصة "الرحلة". صوتك هو مزيج من خبير تربوي يفهم "لماذا"، وراوي قصص شغوف يثير الحماس، ومستشار هدايا مدروس يساعد في خلق لحظات لا تُنسى. أنت متعاطف، صبور إلى ما لا نهاية، ومتعتك الأساسية هي مساعدة الآباء على رعاية الشرارة الفريدة لأطفالهم.

**Tone of Voice:**
كن دائمًا دافئًا وإيجابيًا ومشجعًا وخياليًا بعض الشيء. استخدم لغة متعاطفة مثل "إنه عمر رائع لسرد القصص..." أو "أتفهم تمامًا، قد يكون من الصعب العثور على الهدية المناسبة...". خاطب المستخدم باحترام ومباشرة.

**Primary Goal:**
هدفك النهائي هو بناء علاقة موثوقة مع ولي الأمر، مما يجعله يشعر بالفهم والثقة في خياراته. من خلال تقديم نصائح ثاقبة ومخصصة، تقوم بتوجيهه بشكل طبيعي إلى المنتج المثالي الذي سيجعل طفله يشعر بأنه مرئي ومحتفى به ومحبوب. ينتهي التفاعل الناجح بشعور ولي الأمر بالحماس والاستعداد لبدء رحلة طفله الإبداعية.

**Core Knowledge Base:**

**1. عن منصة "الرحلة":**
- **المفهوم:** ${aboutContent.intro_text || 'منظومة تربوية إبداعية متكاملة، صُممت لتكون الرفيق الأمين لكل طفل في رحلته نحو اكتشاف ذاته.'}
- **القيم الأساسية:** تخصيص فريد، إشراف تربوي، محتوى عربي أصيل.
- **المشروعان الرئيسيان:** "إنها لك" (قصص مخصصة) و"بداية الرحلة" (كتابة إبداعية).

**2. كتالوج منتجات "إنها لك" (الأسعار بالجنيه المصري):**
  - القصة المخصصة (مطبوعة + إلكترونية): ${prices.story.printed}
  - القصة المخصصة (إلكترونية فقط): ${prices.story.electronic}
  - دفتر التلوين: ${prices.coloringBook}
  - كتيب الأذكار والأدعية: ${prices.duaBooklet}
  - بوكس الهدية (المجموعة الكاملة): ${prices.giftBox}
  - **معلومات تفصيلية:**
${enhaLakProducts}

**3. برنامج "بداية الرحلة" للكتابة الإبداعية:**
- **المفهوم:** ليس مجرد تعليم، بل احتفال بصوت الطفل الفريد في جلسات فردية مباشرة وآمنة.
- **المنهجية:** نساعد الطفل على "اصطياد الأفكار"، "بناء العوالم"، "الرسم بالكلمات"، و"تحرير صوته".
- **المخرجات:** الثقة للتعبير، اكتساب الكتابة كصديق ومتنفس، وإدراك قوة الإبداع لديه.
- **باقات البرنامج:**
${cwPackages}

**4. صندوق الرحلة الشهري:**
- **المفهوم:** اشتراك سنوي (بسعر ${prices.subscriptionBox * 12} ج.م) يصلكم كل شهر صندوق مليء بالإبداع.
- **المحتويات:** قصة جديدة، نشاط إبداعي، وهدية مفاجأة كل شهر.

**5. أسئلة شائعة:**
- **الشحن:** داخل مصر فقط للمنتجات المطبوعة. تتوفر نسخ إلكترونية للجميع.
- **الدفع:** Instapay والمحافظ الإلكترونية.
- **منصة الجلسات:** نستخدم منصة Jitsi الآمنة والتي لا تتطلب تحميل برامج.

**6. معلومات عن أطفال المستخدم:**
${childrenInfo}

**Rules of Engagement:**
1.  **JSON Output ONLY:** يجب أن تكون استجابتك دائمًا بتنسيق JSON المحدد.
2.  **استخدم معلومات الأطفال:** انتبه جيدًا للمعلومات المتوفرة عن أطفال المستخدم. استخدم أسماءهم واهتماماتهم لتقديم نصائح شخصية للغاية. مثال: "أرى أن ابنك أحمد يحب الديناصورات، قصة مخصصة عن مغامر شجاع يكتشف ديناصوراً قد تكون رائعة له!".
3.  **قدّم المشورة، لا تبع فقط:** ابدأ بتقديم نصيحة حقيقية أو رؤية تربوية بناءً على استعلام المستخدم، ثم اربطها بسلاسة بتوصية المنتج.
4.  **اقتراحات استباقية وذات صلة:** إذا سأل المستخدم عن تنمية الخيال، اشرح كيف يساعد برنامج الكتابة الإبداعية واقترح باقة مناسبة.
5.  **اطرح أسئلة توضيحية:** إذا كان الطلب غامضًا، اسأل عن عمر الطفل واهتماماته إذا لم تكن المعلومات متوفرة.
6.  **دائماً اختم بسؤال جذاب أو دعوة للعمل:** شجع على مزيد من التفاعل.
`;
};

const ProductSuggestionCard: React.FC<{ productKey: string, onCloseWidget: () => void }> = ({ productKey, onCloseWidget }) => {
    const product = productDetails.find(p => p.key === productKey);
    const [imageLoaded, setImageLoaded] = useState(false);
    if (!product) return null;

    return (
        <div className="mt-4 border-t border-white/20 pt-4">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg flex items-center gap-4 text-gray-800 border border-white/50 shadow-inner">
                <div className="relative w-20 h-20 rounded-md flex-shrink-0 bg-white">
                    {!imageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md"></div>}
                    <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className={`w-full h-full object-cover rounded-md transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold">{product.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <Link to={product.link} onClick={onCloseWidget} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
                        <span>اعرف المزيد</span>
                        <ArrowLeft size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

const MessageBubble: React.FC<{ message: DisplayMessage, onCloseWidget: () => void }> = ({ message, onCloseWidget }) => {
    const isUser = message.role === 'user';
    
    const bubbleClass = isUser
      ? 'bg-blue-600 text-white self-end rounded-2xl rounded-br-md shadow-md'
      : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white self-start rounded-2xl rounded-bl-md shadow-lg';
    
    const icon = isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />;
    
    return (
      <div className={`flex items-start gap-3 w-full max-w-full mx-auto ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full shadow-md ${isUser ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-indigo-500'}`}>
          {icon}
        </div>
        <div className={`px-5 py-3 ${bubbleClass}`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
          {message.productSuggestion && <ProductSuggestionCard productKey={message.productSuggestion.key} onCloseWidget={onCloseWidget} />}
        </div>
      </div>
    );
};

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose }) => {
  const [chatHistory, setChatHistory] = useState<DisplayMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const { prices, loading: pricesLoading } = useProduct();
  const { siteContent, loading: adminLoading } = useAdmin();
  const { creativeWritingPackages, loading: cwLoading } = useCreativeWritingAdmin();
  const { fetchAiChatHistory, saveAiChatHistory, isLoggedIn, childProfiles } = useAuth();

  const isDataLoading = pricesLoading || adminLoading || cwLoading;

  const systemInstruction = useMemo(() => {
    if (isDataLoading || !prices || !siteContent?.about?.intro_text || !creativeWritingPackages) {
        return 'أنت مساعد ذكي لمنصة الرحلة. البيانات غير متوفرة حالياً.';
    }
    return generateSystemInstruction(prices, siteContent, creativeWritingPackages, childProfiles);
  }, [isDataLoading, prices, siteContent, creativeWritingPackages, childProfiles]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const loadHistory = async () => {
        if (!isDataLoading && isLoggedIn) {
            try {
                const history = await fetchAiChatHistory();
                if (history && history.length > 0) {
                    setChatHistory(history);
                } else {
                     setChatHistory([
                        { id: Date.now(), role: 'model', text: 'أهلاً بك في منصة الرحلة! أنا "المرشد الإبداعي" هنا لمساعدتك. كيف يمكنني أن أخدمك اليوم؟' },
                    ]);
                }
            } catch (e) {
                console.error("Failed to load chat history", e);
                setError("لم نتمكن من تحميل سجل المحادثة السابق.");
            } finally {
                setHistoryLoaded(true);
            }
        } else if (!isLoggedIn) {
             setChatHistory([
                { id: Date.now(), role: 'model', text: 'أهلاً بك! أنا "المرشد الإبداعي". يرجى تسجيل الدخول لحفظ محادثاتك.' },
            ]);
            setHistoryLoaded(true);
        }
    };
    loadHistory();
  }, [isOpen, isDataLoading, fetchAiChatHistory, isLoggedIn]);
  
  const handleSendMessage = async (prompt?: string) => {
    const originalMessage = prompt || userInput;
    if (!originalMessage.trim() || isLoading) return;

    if (isDataLoading) {
        setError('عذراً، بيانات المنصة غير متاحة حالياً. يرجى المحاولة لاحقاً.');
        return;
    }
    
    const userMessage: DisplayMessage = { id: Date.now(), role: 'user', text: originalMessage };
    
    setChatHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);
    
    const apiHistory: Content[] = [...chatHistory, userMessage].map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: apiHistory, systemInstruction }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get response.');
        }

      const parsedJson = await response.json();
      const modelMessage: DisplayMessage = {
        id: Date.now() + 1,
        role: 'model',
        text: parsedJson.responseText,
        productSuggestion: parsedJson.suggestedProductKey ? { key: parsedJson.suggestedProductKey } : undefined
      };
      setChatHistory(prev => {
        const newHistory = [...prev, modelMessage];
        if (historyLoaded && isLoggedIn) saveAiChatHistory(newHistory);
        return newHistory;
      });
    } catch (err: any) {
      console.error("API Fetch Error:", err);
      setError('عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.');
      setChatHistory(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionChips = [
    { text: 'ما هي أسعار القصص؟', icon: '💰' },
    { text: 'أريد هدية لطفل عمره 5 سنوات', icon: '🎁' },
    { text: 'ما هو برنامج الكتابة الإبداعية؟', icon: '✍️' },
  ];
  
  return (
    <div className={`fixed bottom-6 left-6 z-[60] flex flex-col bg-white/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 transition-all duration-500 ease-in-out
      ${isOpen 
        ? 'w-[calc(100%-48px)] max-w-md h-[70vh] max-h-[600px] opacity-100' 
        : 'w-16 h-16 opacity-0 pointer-events-none'
      }`} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="chat-widget-title"
      aria-hidden={!isOpen}
    >
      <header className="flex items-center justify-between p-4 border-b bg-white/80 rounded-t-2xl flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                <MessageSquare size={20} />
            </div>
            <div>
                <h2 id="chat-widget-title" className="font-bold text-gray-800">المرشد الإبداعي</h2>
                <p className="text-xs text-gray-500">هنا لمساعدتك!</p>
            </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full" aria-label="إغلاق الدردشة">
            <X size={20} />
        </button>
      </header>
      
      <div className="flex-grow overflow-y-auto space-y-6 p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-white">
        {chatHistory.map((msg) => <MessageBubble key={msg.id} message={msg} onCloseWidget={onClose} />)}
        {isLoading && (
           <div className="flex items-start gap-3 w-full max-w-full mx-auto flex-row">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shadow-md"><Bot size={20} className="text-white" /></div>
              <div className="px-5 py-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white self-start rounded-2xl rounded-bl-md shadow-lg flex items-center gap-2">
                  <Loader2 className="animate-spin text-white" size={20} />
                  <span className="text-white/80">المرشد يكتب...</span>
              </div>
           </div>
        )}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        <div ref={chatEndRef} />
      </div>

      <footer className="p-4 border-t bg-white/80 rounded-b-2xl flex-shrink-0">
          {chatHistory.length <= 1 && !isLoading && !isDataLoading && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-3 animate-fadeIn">
                  {suggestionChips.map(chip => (
                      <button key={chip.text} onClick={() => handleSendMessage(chip.text)} className="bg-white/80 backdrop-blur-sm text-xs border border-gray-300 text-gray-800 px-3 py-1.5 rounded-full hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all transform hover:scale-105 shadow-sm font-medium">
                          <span className="me-2">{chip.icon}</span>
                          {chip.text}
                      </button>
                  ))}
              </div>
          )}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="flex items-center gap-3 bg-white p-2 rounded-full shadow-md border"
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isDataLoading ? 'جاري تحميل البيانات...' : 'اكتب رسالتك هنا...'}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 px-3"
            disabled={isLoading || isDataLoading}
            aria-label="اكتب رسالتك"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim() || isDataLoading}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full p-2.5 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-300 disabled:cursor-not-allowed transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="إرسال"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWidget;