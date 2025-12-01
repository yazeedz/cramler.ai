import { TourLanguage } from '@/contexts/TourContext'

export interface TourStep {
  title: string
  text: string
  buttons: {
    skip?: string
    back?: string
    next?: string
    start?: string
    finish?: string
  }
}

export interface TourTranslations {
  newPage: {
    welcome: TourStep
    packageSelector: TourStep
    customizeDeck: TourStep
    tagSelector: TourStep
    collectionSelector: TourStep
    statusSelector: TourStep
    questionCount: TourStep
    createButton: TourStep
    chatTextarea: TourStep
    sendButton: TourStep
  }
  deckPage: {
    welcome: TourStep
    deckName: TourStep
    deckNavigation: TourStep
    questionContent: TourStep
    questionOptions: TourStep
    revealButton: TourStep
    discussionButton: TourStep
  }
}

const translations: Record<TourLanguage, TourTranslations> = {
  en: {
    newPage: {
      welcome: {
        title: '👋 Welcome to Cramler!',
        text: `
          <div class="space-y-4">
            <p>Let's create your first study deck! This tour will guide you through the process step by step.</p>
            <p>You'll learn how to select packages, customize your deck, and start studying.</p>
            <div class="border-t pt-3 mt-4">
              <p class="text-sm font-medium mb-2">Prefer Hebrew? רוצים עברית?</p>
              <button id="tour-lang-hebrew" class="text-blue-500 hover:text-blue-600 text-sm underline">Switch to Hebrew / עבור לעברית</button>
            </div>
          </div>
        `,
        buttons: {
          skip: 'Skip Tour',
          start: 'Start Tour'
        }
      },
      packageSelector: {
        title: '📚 Choose Your Package',
        text: `
          <div class="space-y-2">
            <p>First, choose a study package here.</p>
            <p>Each package contains curated questions for different subjects or exams.</p>
            <p>You can purchase messages from the <a href="/upgrade" class="text-blue-500" target="_blank" rel="noopener noreferrer">upgrade page</a>.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      customizeDeck: {
        title: '🎯 Customize Your Deck',
        text: `
          <div class="space-y-2">
            <p>Now you can customize your deck by selecting specific tags, collections, and progress status.</p>
            <p>Click on each filter below to see your options.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      tagSelector: {
        title: '🏷️ Filter by Tags',
        text: `
          <div class="space-y-2">
            <p>Click here to select specific topics or tags.</p>
            <p>This helps you focus on particular areas of study.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      collectionSelector: {
        title: '📝 Choose Collections',
        text: `
          <div class="space-y-2">
            <p>Select which question collections to include.</p>
            <p>Collections refer to official exams, quizzes, and more.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      statusSelector: {
        title: '📊 Filter by Progress',
        text: `
          <div class="space-y-2">
            <p>Choose questions based on your previous performance.</p>
            <p>Focus on questions you haven't seen, got wrong, or want to review.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      questionCount: {
        title: '🔢 Set Question Count',
        text: `
          <div class="space-y-2">
            <p>Choose how many questions you want in your deck.</p>
            <p>The number on the right shows total available questions after filtering.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      createButton: {
        title: '🚀 Create Your Deck',
        text: `
          <div class="space-y-2">
            <p>Click this button to create your customized deck!</p>
            <p>It will create the deck based on your filters.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      chatTextarea: {
        title: '💬 Chat Interface',
        text: `
          <div class="space-y-2">
            <p>This is where you can type messages or questions.</p>
            <p>Soon you'll be able to ask questions about your studies!</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      sendButton: {
        title: '📤 Send Message',
        text: `
          <div class="space-y-2">
            <p>Click here to send your message or create your deck.</p>
            <p>You're all set to start studying! Good luck!</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          finish: 'Finish Tour'
        }
      }
    },
    deckPage: {
      welcome: {
        title: '👋 Welcome to Your Deck!',
        text: `
          <div class="space-y-4">
            <p>Great job creating your deck! Let's take a quick tour of the study interface.</p>
            <p>This will help you get the most out of your study session.</p>
            <div class="border-t pt-3 mt-4">
              <p class="text-sm font-medium mb-2">Prefer Hebrew? רוצים עברית?</p>
              <button id="tour-lang-hebrew" class="text-blue-500 hover:text-blue-600 text-sm underline">Switch to Hebrew / עבור לעברית</button>
            </div>
          </div>
        `,
        buttons: {
          skip: 'Skip Tour',
          start: 'Start Tour'
        }
      },
      deckName: {
        title: '📝 Deck Information',
        text: `
          <div class="space-y-2">
            <p>This shows your deck name and options.</p>
            <p>Click here to rename, star, or manage your deck.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      deckNavigation: {
        title: '🧭 Navigation Controls',
        text: `
          <div class="space-y-2">
            <p>Use these controls to navigate between questions.</p>
            <p>You can also use keyboard shortcuts: Ctrl/Cmd + ← or → arrows.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      questionContent: {
        title: '📖 Question Content',
        text: `
          <div class="space-y-2">
            <p>This area displays the question text and any images or diagrams.</p>
            <p>Read the question carefully before selecting your answer.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      questionOptions: {
        title: '✅ Answer Options',
        text: `
          <div class="space-y-2">
            <p>Select your answer by clicking on the radio button.</p>
            <p>You can also click on the option text to strike it through for elimination.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      revealButton: {
        title: '👁️ Reveal Answer',
        text: `
          <div class="space-y-2">
            <p>After selecting an answer, click here to reveal the correct answer.</p>
            <p>You can also use the keyboard shortcut: Ctrl/Cmd + E.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          next: 'Next'
        }
      },
      discussionButton: {
        title: '💬 Discussion Panel',
        text: `
          <div class="space-y-2">
            <p>Click here to toggle the discussion panel.</p>
            <p>Soon you'll be able to chat about questions and get help!</p>
            <p>You can also use Ctrl/Cmd + D to toggle it quickly.</p>
          </div>
        `,
        buttons: {
          back: 'Back',
          finish: 'Finish Tour'
        }
      }
    }
  },
  he: {
    newPage: {
      welcome: {
        title: '👋 ברוכים הבאים ל-Cramler!',
        text: `
          <div class="space-y-4" dir="rtl">
            <p>בואו ניצור את חפיסת הלמידה הראשונה שלכם! הסיור הזה ידריך אתכם בתהליך צעד אחר צעד.</p>
            <p>תלמדו איך לבחור חבילות, להתאים אישית את החפיסה שלכם, ולהתחיל ללמוד.</p>
            <div class="border-t pt-3 mt-4">
              <p class="text-sm font-medium mb-2">מעדיפים אנגלית? Prefer English?</p>
              <button id="tour-lang-english" class="text-blue-500 hover:text-blue-600 text-sm underline">Switch to English / עבור לאנגלית</button>
            </div>
          </div>
        `,
        buttons: {
          skip: 'דלג על הסיור',
          start: 'התחל סיור'
        }
      },
      packageSelector: {
        title: '📚 בחרו את החבילה שלכם',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>ראשית, בחרו חבילת לימוד כאן.</p>
            <p>כל חבילה מכילה שאלות נבחרות לנושאים או בחינות שונות.</p>
            <p>אתם יכולים לרכוש חבילות מ<a href="/upgrade" class="text-blue-500" target="_blank" rel="noopener noreferrer">עמוד השדרוג</a>.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      customizeDeck: {
        title: '🎯 התאימו אישית את החפיסה',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>כעת תוכלו להתאים אישית את החפיסה על ידי בחירת תגיות, אוספים ומצבי התקדמות ספציפיים.</p>
            <p>לחצו על כל מסנן למטה כדי לראות את האפשרויות שלכם.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      tagSelector: {
        title: '🏷️ סנן לפי תגיות',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>לחצו כאן כדי לבחור נושאים או תגיות ספציפיות.</p>
            <p>זה עוזר לכם להתמקד בנושאים מסוימים.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      collectionSelector: {
        title: '📝 בחרו אוספים',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>בחרו אילו אוספי שאלות לכלול.</p>
            <p>אוספים מתייחסים לבחינות רשמיות, בחנים ועוד.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      statusSelector: {
        title: '📊 סנן לפי התקדמות',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>בחרו שאלות על בסיס הביצועים הקודמים שלכם.</p>
            <p>התמקדו בשאלות שלא ראיתם, שטעיתם בהן, או שאתם רוצים לחזור עליהן.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      questionCount: {
        title: '🔢 הגדירו מספר שאלות',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>בחרו כמה שאלות אתם רוצים בחפיסה שלכם.</p>
            <p>המספר בצד ימין מציג את סך השאלות הזמינות לאחר הסינון.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      createButton: {
        title: '🚀 צרו את החפיסה שלכם',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>לחצו על הכפתור הזה כדי ליצור את החפיסה המותאמת אישית שלכם!</p>
            <p>זה ייצור את החפיסה על בסיס המסננים שלכם.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      chatTextarea: {
        title: '💬 ממשק צ\'אט',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>כאן תוכלו להקליד הודעות או שאלות.</p>
            <p>בקרוב תוכלו לשאול שאלות על הלימודים שלכם!</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      sendButton: {
        title: '📤 שלח הודעה',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>לחצו כאן כדי לשלוח את ההודעה שלכם או ליצור את החפיסה שלכם.</p>
            <p>אתם מוכנים להתחיל ללמוד! בהצלחה!</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          finish: 'סיים סיור'
        }
      }
    },
    deckPage: {
      welcome: {
        title: '👋 ברוכים הבאים לחפיסה שלכם!',
        text: `
          <div class="space-y-4" dir="rtl">
            <p>כל הכבוד על יצירת החפיסה! בואו נעשה סיור קצר בממשק הלמידה.</p>
            <p>זה יעזור לכם להפיק את המקסימום מהלמידה שלכם.</p>
            <div class="border-t pt-3 mt-4">
              <p class="text-sm font-medium mb-2">מעדיפים אנגלית? Prefer English?</p>
              <button id="tour-lang-english" class="text-blue-500 hover:text-blue-600 text-sm underline">Switch to English / עבור לאנגלית</button>
            </div>
          </div>
        `,
        buttons: {
          skip: 'דלג על הסיור',
          start: 'התחל סיור'
        }
      },
      deckName: {
        title: '📝 מידע על החפיסה',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>כאן מוצג שם החפיסה והאפשרויות שלה.</p>
            <p>לחצו כאן כדי לשנות שם, לסמן בכוכב, או לנהל את החפיסה שלכם.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      deckNavigation: {
        title: '🧭 בקרי ניווט',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>השתמשו בבקרים האלה כדי לנווט בין השאלות.</p>
            <p>תוכלו גם להשתמש בקיצורי המקלדת: Ctrl/Cmd + ← או → חצים.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      questionContent: {
        title: '📖 תוכן השאלה',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>האזור הזה מציג את טקסט השאלה וכל התמונות או התרשימים.</p>
            <p>קראו את השאלה בעיון לפני בחירת התשובה שלכם.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      questionOptions: {
        title: '✅ אפשרויות תשובה',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>בחרו את המסיח שלכם על ידי לחיצה על כפתור הסימן שלה.</p>
            <p>תוכלו גם ללחוץ על טקסט האפשרות כדי לחצות אותה לעזור לכם בלמידה.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      revealButton: {
        title: '👁️ חשף תשובה',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>לאחר בחירת תשובה, לחצו כאן כדי לחשף את התשובה הנכונה.</p>
            <p>תוכלו גם להשתמש בקיצור המקלדת: Ctrl/Cmd + E.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          next: 'הבא'
        }
      },
      discussionButton: {
        title: '💬 פאנל דיון',
        text: `
          <div class="space-y-2" dir="rtl">
            <p>לחצו כאן כדי להחליף את מצב פאנל הדיון.</p>
            <p>בקרוב תוכלו לשוחח על שאלות ולקבל עזרה!</p>
            <p>תוכלו גם להשתמש ב-Ctrl/Cmd + D כדי להחליף מצב במהירות.</p>
          </div>
        `,
        buttons: {
          back: 'חזור',
          finish: 'סיים סיור'
        }
      }
    }
  }
}

export function getTourTranslations(language: TourLanguage): TourTranslations {
  return translations[language]
}

export function getTourStepTranslation(
  language: TourLanguage,
  tourType: 'newPage' | 'deckPage',
  stepKey: string
): TourStep {
  const tourTranslations = getTourTranslations(language)
  const step = (tourTranslations[tourType] as any)[stepKey] as TourStep
  if (!step) {
    throw new Error(`Tour step not found: ${tourType}.${stepKey}`)
  }
  return step
} 