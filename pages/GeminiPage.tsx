
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Content, Type } from "@google/genai";
import { Bot, User, Send, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { useAdmin } from '../contexts/AdminContext';
// FIX: Switched to namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';

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

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    responseText: {
      type: Type.STRING,
      description: 'The conversational, friendly, and persuasive text response in Arabic. Must include a call to action.'
    },
    suggestedProductKey: {
      type: Type.STRING,
      description: `The unique key of a product to suggest from the list. Must be one of [${productDetails.map(p => `'${p.key}'`).join(', ')}]. Should be an empty string "" if no specific product is relevant.`
    }
  },
  required: ['responseText', 'suggestedProductKey']
};


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSystemInstruction = (prices, siteContent) => {
    if (!prices || !siteContent?.about?.intro_text) {
        return 'أنت مساعد ذكي لمنصة الرحلة. البيانات غير متوفرة حالياً.';
    }

    const productInfoForPrompt = productDetails.map(p => 
      `- المنتج: "${p.title}" (المفتاح: ${p.key}). الوصف: ${p.description}.`
    ).join('\n');

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
- **القيم الأساسية:** 
  - **تخصيص فريد:** نحول الطفل من مجرد قارئ إلى بطل حقيقي للحكاية، مما يعزز هويته وحبه للقراءة.
  - **إشراف تربوي:** يتم إعداد كل محتوياتنا بإشراف خبراء تربويين لضمان غرس قيم إيجابية وسليمة.
  - **محتوى عربي أصيل:** نلتزم بتقديم محتوى عالي الجودة باللغة العربية.

**2. كتالوج منتجات "إنها لك" (الأسعار بالجنيه المصري):**
  - القصة المخصصة (مطبوعة + إلكترونية): ${prices.story.printed}
  - القصة المخصصة (إلكترونية فقط): ${prices.story.electronic}
  - دفتر التلوين: ${prices.coloringBook}
  - كتيب الأذكار والأدعية: ${prices.duaBooklet}
  - بوكس الهدية (المجموعة الكاملة): ${prices.giftBox}

**3. معلومات تفصيلية عن المنتجات (للتوصيات):**
${productInfoForPrompt}

**Expertise Domain (خبير القصص المخصصة):**
أنت تفهم القيمة التعليمية والنفسية العميقة للتخصيص.
- **لماذا هو فعال:** "عندما يصبح الطفل بطل قصته، يزداد تفاعله وحبه للقراءة بشكل كبير. رؤية اسمه وتفاصيله في كتاب يؤكد هويته ويجعل قيم القصة أكثر تأثيرًا، كما يعزز ثقته بنفسه بشكل لا يصدق."
- **كيف نعمل:** "يقدم أولياء الأمور اسم الطفل وعمره وبعض الصور الواضحة، بالإضافة إلى سماته الشخصية أو هواياته. ثم يقوم فريقنا من الكتاب والرسامين المحترفين بنسج هذه التفاصيل ببراعة في قصة فريدة، مما يجعل الطفل هو النجم."
- **الهدف:** "هدفنا ليس الترفيه فقط، بل تعزيز احترام الذات، وترسيخ القيم الإيجابية، وإنشاء تذكار عزيز يقوي الرابطة الأسرية ويشجع على القراءة مدى الحياة."

**Rules of Engagement:**
1.  **JSON Output ONLY:** يجب أن تكون استجابتك دائمًا بتنسيق JSON المحدد في الـ schema. لا تستخدم markdown أو أي نص آخر خارج بنية JSON.
2.  **قدّم المشورة، لا تبع فقط:** دورك الأساسي هو أن تكون مرشدًا مفيدًا. ابدأ بتقديم نصيحة حقيقية أو رؤية تربوية بناءً على استعلام المستخدم. *ثم*، اربط تلك الرؤية بسلاسة بتوصية المنتج. لا تبدأ أبدًا بالمنتج.
3.  **اقتراحات استباقية وذات صلة:** ابحث دائمًا عن فرصة لاقتراح منتج. إذا سأل المستخدم عن هدية لطفل خجول، اشرح كيف تساعد القصص المخصصة في بناء الثقة واقترح "القصة المخصصة".
4.  **اطرح أسئلة توضيحية:** إذا كان طلب المستخدم غامضًا (مثل "ماذا لديكم؟")، فلا تقم فقط بسرد المنتجات. اطرح أسئلة توجيهية لطيفة لمعرفة المزيد. على سبيل المثال: "يسعدني المساعدة! للعثور على الخيار الأمثل، هل يمكنك إخباري قليلاً عن الطفل؟ ما هو عمره وما هي اهتماماته حاليًا؟"
5.  **دائماً اختم بسؤال جذاب أو دعوة للعمل:** لا تترك المحادثة في طريق مسدود. شجع على مزيد من التفاعل. أمثلة: "هل تود أن تعرف كيف نقوم بتخصيص الرسومات؟"، "هل نستكشف معًا ما هي القيمة الأخلاقية الأنسب لقصة طفلك؟".
`;
};


// --- Sub-components ---

const ProductSuggestionCard: React.FC<{ productKey: string }> = ({ productKey }) => {
    const product = productDetails.find(p => p.key === productKey);
    if (!product) return null;

    return (
        <div className="mt-4 border-t border-white/20 pt-4">
            <div className="bg-white/10 p-3 rounded-lg flex items-center gap-4 text-white">
                <img src={product.imageUrl} alt={product.title} className="w-20 h-20 rounded-md object-cover flex-shrink-0 bg-white" />
                <div className="flex-grow">
                    <h4 className="font-bold">{product.title}</h4>
                    <p className="text-sm opacity-90 mb-3">{product.description}</p>
                    <ReactRouterDOM.Link to={product.link} className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                        <span>اعرف المزيد</span>
                        <ArrowLeft size={16} />
                    </ReactRouterDOM.Link>
                </div>
            </div>
        </div>
    );
};

const MessageBubble: React.FC<{ message: DisplayMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    
    const bubbleClass = isUser
      ? 'bg-blue-600 text-white self-end rounded-2xl rounded-br-md shadow-md'
      : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white self-start rounded-2xl rounded-bl-md shadow-lg';
    
    const icon = isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />;
    
    return (
      <div className={`flex items-start gap-3 w-full max-w-2xl mx-auto ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full shadow-md ${isUser ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-indigo-500'}`}>
          {icon}
        </div>
        <div className={`px-5 py-3 ${bubbleClass}`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
          {message.productSuggestion && <ProductSuggestionCard productKey={message.productSuggestion.key} />}
        </div>
      </div>
    );
};


// --- Main Component ---

const GeminiPage: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<DisplayMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { prices, loading: pricesLoading } = useProduct();
  const { siteContent, loading: adminLoading } = useAdmin();

  const isDataLoading = pricesLoading || adminLoading;

  const systemInstruction = useMemo(() => {
    if (isDataLoading || !prices || !siteContent?.about?.intro_text) {
        return 'أنت مساعد ذكي لمنصة الرحلة. البيانات غير متوفرة حالياً.';
    }
    return generateSystemInstruction(prices, siteContent);
  }, [isDataLoading, prices, siteContent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Load chat history from sessionStorage on initial load
  useEffect(() => {
    try {
      const storedHistory = sessionStorage.getItem('geminiChatHistory');
      if (storedHistory) {
        setChatHistory(JSON.parse(storedHistory));
      } else if (!isDataLoading) {
        // Only set welcome message if there's no stored history
        setChatHistory([
          {
            id: Date.now(),
            role: 'model',
            text: 'أهلاً بك في منصة الرحلة! أنا "المرشد الإبداعي" هنا لمساعدتك في اختيار الهدية والقصة المثالية لطفلك. كيف يمكنني أن أخدمك اليوم؟',
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to parse chat history from sessionStorage", error);
      // Fallback to welcome message if parsing fails
       if (!isDataLoading) {
        setChatHistory([
          {
            id: Date.now(),
            role: 'model',
            text: 'أهلاً بك في منصة الرحلة! أنا "المرشد الإبداعي" هنا لمساعدتك في اختيار الهدية والقصة المثالية لطفلك. كيف يمكنني أن أخدمك اليوم؟',
          },
        ]);
      }
    }
  }, [isDataLoading]);

  // Save chat history to sessionStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      sessionStorage.setItem('geminiChatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);
  
  const handleSendMessage = async (prompt?: string) => {
    const originalMessage = prompt || userInput;
    if (!originalMessage.trim() || isLoading) return;

    if (isDataLoading) {
        setError('عذراً، بيانات الأسعار غير متاحة حالياً. يرجى المحاولة لاحقاً.');
        return;
    }
    
    const userMessage: DisplayMessage = { id: Date.now(), role: 'user', text: originalMessage };
    const newDisplayHistory = [...chatHistory, userMessage];
    setChatHistory(newDisplayHistory);
    setUserInput('');
    setIsLoading(true);
    setError(null);
    
    const apiHistory: Content[] = newDisplayHistory
        .filter(m => m.role === 'user' || (m.role === 'model' && m.text))
        .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: apiHistory,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        }
      });
      
      const responseText = response.text;
      const parsedJson = JSON.parse(responseText.trim());

      const modelMessage: DisplayMessage = {
        id: Date.now() + 1,
        role: 'model',
        text: parsedJson.responseText,
        productSuggestion: parsedJson.suggestedProductKey ? { key: parsedJson.suggestedProductKey } : undefined
      };
      
      setChatHistory(prev => [...prev, modelMessage]);

    } catch (err) {
      console.error("Gemini API Error:", err);
      setError('عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.');
      setChatHistory(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionChips = [
    { text: 'ما هي أسعار القصص؟', icon: '💰' },
    { text: 'أريد هدية لطفل عمره 5 سنوات', icon: '🎁' },
    { text: 'كيف تتم عملية تخصيص القصة؟', icon: '🤔' },
    { text: 'ما فائدة القصة المخصصة؟', icon: '✍️' },
  ];
  
  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-white min-h-[calc(100vh-160px)] py-12 sm:py-16 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
           <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 p-1 rounded-full mb-4 shadow-lg">
                <div className="bg-white/80 backdrop-blur-sm rounded-full p-4">
                    <Sparkles size={40} className="text-purple-600" />
                </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
              المرشد الإبداعي
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              رفيقك الذكي في رحلة اختيار الهدية المثالية. اسألني أي شيء لمساعدة طفلك على أن يصبح بطل قصته!
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-4 min-h-[60vh] flex flex-col border border-gray-200">
            <div className="flex-grow overflow-y-auto space-y-6 p-4">
              {chatHistory.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
              {isLoading && (
                 <div className="flex items-start gap-3 w-full max-w-2xl mx-auto flex-row">
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

            <div className="pt-4 border-t border-gray-200/80 mt-4">
                {chatHistory.length <= 1 && !isLoading && !isDataLoading && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-4 animate-fadeIn">
                        {suggestionChips.map(chip => (
                            <button key={chip.text} onClick={() => handleSendMessage(chip.text)} className="bg-white/80 backdrop-blur-sm text-sm border border-gray-300 text-gray-800 px-4 py-2 rounded-full hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all transform hover:scale-105 shadow-sm font-medium">
                                <span className="me-2">{chip.icon}</span>
                                {chip.text}
                            </button>
                        ))}
                    </div>
                )}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg border border-gray-200/80"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={isDataLoading ? 'جاري تحميل البيانات...' : 'اكتب رسالتك هنا...'}
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-700 px-4"
                  disabled={isLoading || isDataLoading}
                  aria-label="اكتب رسالتك"
                />
                <button
                  type="submit"
                  disabled={isLoading || !userInput.trim() || isDataLoading}
                  className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full p-3 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-300 disabled:cursor-not-allowed transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="إرسال"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiPage;
