import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Content, Type } from "@google/genai";
import { Bot, User, Send, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { useProduct } from '../contexts/ProductContext';
import { useAdmin } from '../contexts/AdminContext';
import { Link } from 'react-router-dom';

// --- Static Data and Types ---

const productDetails = [
  {
    key: 'custom-story',
    title: 'القصة المخصصة',
    description: 'قصة فريدة تجعل طفلك بطل الحكاية، مع دمج اسمه وصورته.',
    imageUrl: 'https://i.ibb.co/P9tGk1X/product-custom-story.png',
    link: '/order'
  },
  {
    key: 'coloring-book',
    title: 'دفتر التلوين',
    description: 'شخصيات طفلك من قصته في دفتر تلوين ممتع.',
    imageUrl: 'https://i.ibb.co/m9xG3yS/product-coloring-book.png',
    link: '/order'
  },
  {
    key: 'values-story',
    title: 'قصص الآداب والقيم',
    description: 'قصص هادفة لغرس قيمة محددة مثل الصدق أو التعاون.',
    imageUrl: 'https://i.ibb.co/kH7X6tT/product-values-story.png',
    link: '/order'
  },
  {
    key: 'skills-story',
    title: 'المهارات الحياتية',
    description: 'قصص لتنمية مهارات هامة مثل تنظيم الوقت وحل المشكلات.',
    imageUrl: 'https://i.ibb.co/2d1h4fS/product-skills-story.png',
    link: '/order'
  },
  {
    key: 'dua-booklet',
    title: 'كتيب الأذكار والأدعية',
    description: 'رفيق يومي مصور لتعليم الأدعية والأذكار اليومية.',
    imageUrl: 'https://i.ibb.co/R4k5p1S/product-dua-booklet.png',
    link: '/order'
  },
  {
    key: 'gift-box',
    title: 'بوكس الهدية',
    description: 'المجموعة الكاملة في بوكس أنيق، أفضل هدية متكاملة.',
    imageUrl: 'https://i.ibb.co/dK5zZ7s/product-gift-box.png',
    link: '/order'
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
    if (!prices || !siteContent?.about?.vision_text) {
        return 'أنت مساعد ذكي لمنصة الرحلة. البيانات غير متوفرة حالياً.';
    }

    const productInfoForPrompt = productDetails.map(p => 
      `- المنتج: "${p.title}" (المفتاح: ${p.key}). الوصف: ${p.description}.`
    ).join('\n');

    const aboutContent = siteContent.about || {};

    return `**Persona:**
أنت "المرشد الإبداعي"، مساعد ذكاء اصطناعي خبير لمنصة "الرحلة" المتخصصة في القصص المخصصة للأطفال. شخصيتك هي مزيج من خبير تربوي، وراوي قصص شغوف، ومستشار هدايا ودود. أنت صبور، مشجع، وخبير في أدب وتنمية الطفل.

**Primary Goal:**
مهمتك هي فهم احتياجات المستخدم (ولي الأمر) بعمق، وتقديم مشورة الخبراء حول أهمية القراءة المخصصة، والتوصية بشكل استباقي بالمنتج الأنسب من مجموعة "إنها لك"، وتوجيههم نحو صفحة الطلب. هدفك هو أن تكون مفيدًا بشكل استثنائي وتبني الثقة، مما يؤدي بشكل طبيعي إلى المبيعات.

**Core Knowledge Base:**

**1. عن منصة "الرحلة":**
- **الرؤية:** ${aboutContent.vision_text || 'أن نكون المنصة الرائدة في العالم العربي التي تجعل كل طفل بطل قصته الخاصة.'}
- **الرسالة:** ${aboutContent.mission_text || 'نصنع بحب وشغف قصصًا مخصصة بالكامل تدمج اسم الطفل وصورته وتفاصيل حياته في مغامرات شيقة.'}
- **القيم الأساسية:** 
  - **تخصيص فريد:** نصنع قصصًا يكون فيها طفلك هو البطل، مما يعزز هويته وحبه للقراءة بشكل لا مثيل له.
  - **إشراف تربوي:** يتم إعداد كل محتوياتنا بإشراف خبراء تربويين لضمان غرس قيم إيجابية وسليمة.
  - **محتوى عربي أصيل:** نلتزم بتقديم محتوى عالي الجودة باللغة العربية، مصمم خصيصًا ليناسب ثقافة وقيم أطفالنا.

**2. كتالوج منتجات "إنها لك" (الأسعار بالجنيه المصري):**
  - القصة المخصصة (مطبوعة + إلكترونية): ${prices.story.printed}
  - القصة المخصصة (إلكترونية فقط): ${prices.story.electronic}
  - دفتر التلوين: ${prices.coloringBook}
  - كتيب الأذكار والأدعية: ${prices.duaBooklet}
  - قصة الآداب والقيم: ${prices.valuesStory}
  - قصة المهارات الحياتية: ${prices.skillsStory}
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
2.  **كن مستشارًا خبيرًا:** لا تقم فقط بسرد المنتجات. أولاً، قدم نصيحة أو رؤية حقيقية بناءً على خبرتك. ثم انتقل بسلاسة إلى توصية بالمنتج.
3.  **اقتراحات استباقية وذات صلة:** ابحث دائمًا عن فرصة لاقتراح منتج. إذا سأل المستخدم عن هدية لطفل خجول، يمكنك شرح كيف تساعد القصص المخصصة في بناء الثقة واقتراح "القصة المخصصة" أو "بوكس الهدية".
4.  **روابط منتجات إلزامية:** إذا كان استعلام المستخدم يتعلق بمنتج ما أو يمكن حله بواسطة منتج، *يجب* عليك تضمين مفتاح المنتج في حقل "suggestedProductKey". إذا لم يكن هناك منتج ذي صلة، فاستخدم سلسلة فارغة "".
5.  **لغة مقنعة ومشجعة:** يجب أن يكون نص استجابتك ("responseText") حواريًا ودافئًا وينتهي دائمًا بدعوة واضحة وجذابة لاتخاذ إجراء (على سبيل المثال، "هل تود معرفة المزيد عن كيفية تأثير القصة على تنمية الخيال؟"، "يمكنك استكشاف كل منتجاتنا الرائعة من هنا.").
6.  **موجز وشامل:** حافظ على إجابات مباشرة ولكن مليئة بالقيمة.

**Example Scenario:**
- User: "ابني عمره 5 سنوات ويحب الديناصورات، ما هي أفضل هدية له؟"
- Your JSON response should be:
  {
    "responseText": "يا لها من فكرة رائعة! طفل في هذا العمر شغوف بالخيال، والديناصورات عالم مذهل. أفضل هدية هي التي تجعله جزءاً من هذا العالم. يمكننا صنع قصة مخصصة يكون فيها طفلك هو عالم الحفريات الشجاع الذي يكتشف ديناصورًا صديقًا! هذا لا يشبع شغفه فحسب، بل يجعله بطل المغامرة. \\n\\n'القصة المخصصة' هي خيارنا الأمثل لمثل هذه الحالة، حيث ندمج اسمه وصورته في الحكاية. هل تود أن أطلعك على تفاصيل أكثر؟",
    "suggestedProductKey": "custom-story"
  }
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
                    <Link to={product.link} className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
                        <span>اعرف المزيد</span>
                        <ArrowLeft size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

const MessageBubble: React.FC<{ message: DisplayMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    
    const bubbleClass = isUser
      ? 'bg-blue-500 text-white self-end rounded-xl rounded-br-lg'
      : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white self-start rounded-xl rounded-bl-lg shadow-sm';
    
    const icon = isUser ? <User size={24} className="text-blue-200" /> : <Bot size={24} className="text-purple-300" />;
    
    return (
      <div className={`flex items-start gap-3 w-full max-w-2xl mx-auto ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${isUser ? 'bg-blue-400' : 'bg-purple-500'}`}>
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
    if (isDataLoading || !prices || !siteContent?.about?.vision_text) {
        return 'أنت مساعد ذكي لمنصة الرحلة. البيانات غير متوفرة حالياً.';
    }
    return generateSystemInstruction(prices, siteContent);
  }, [isDataLoading, prices, siteContent]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);
  
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
  
  useEffect(() => {
      if(!isDataLoading) {
        setChatHistory([{
            id: Date.now(),
            role: 'model',
            text: 'أهلاً بك في منصة الرحلة! أنا "المرشد الإبداعي" هنا لمساعدتك في اختيار الهدية والقصة المثالية لطفلك. كيف يمكنني أن أخدمك اليوم؟',
        }])
      }
  }, [isDataLoading]);
  
  return (
    <div className="bg-gray-50 py-12 sm:py-16 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-purple-600 flex items-center justify-center gap-3">
              <Sparkles size={40} />
              المرشد الإبداعي
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              مساعدك الذكي لاستكشاف عالم القصص المخصصة. اسأل عن أي شيء يخطر ببالك!
            </p>
          </div>
          
          <div className="bg-gray-100/50 rounded-2xl shadow-inner p-4 min-h-[60vh] flex flex-col">
            <div className="flex-grow overflow-y-auto space-y-6 p-4">
              {chatHistory.map((msg) => <MessageBubble key={msg.id} message={msg} />)}
              {isLoading && (
                 <div className="flex items-start gap-3 w-full max-w-2xl mx-auto flex-row">
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-purple-500"><Bot size={24} className="text-purple-300" /></div>
                    <div className="px-5 py-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white self-start rounded-xl rounded-bl-lg shadow-sm flex items-center gap-2">
                        <Loader2 className="animate-spin text-white" size={20} />
                        <span className="text-white/80">المرشد يكتب...</span>
                    </div>
                 </div>
              )}
               {error && <p className="text-red-500 text-center mt-4">{error}</p>}
              <div ref={chatEndRef} />
            </div>

            <div className="pt-4 border-t mt-4">
                {chatHistory.length <= 1 && !isLoading && !isDataLoading && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-4 animate-fadeIn">
                        {suggestionChips.map(chip => (
                            <button key={chip.text} onClick={() => handleSendMessage(chip.text)} className="bg-white text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 hover:border-gray-400 transition-all transform hover:scale-105 shadow-sm">
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
                  className="w-full bg-transparent border-none focus:ring-0 text-gray-700 px-4"
                  disabled={isLoading || isDataLoading}
                  aria-label="اكتب رسالتك"
                />
                <button
                  type="submit"
                  disabled={isLoading || !userInput.trim() || isDataLoading}
                  className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all"
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
