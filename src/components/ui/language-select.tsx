import * as React from "react"
import { Check, ChevronDown, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const languages = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "pt", label: "Português", flag: "🇧🇷" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
  { value: "ko", label: "한국어", flag: "🇰🇷" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { value: "af", label: "Afrikaans", flag: "🇿🇦" },
  { value: "sq", label: "Shqip", flag: "🇦🇱" },
  { value: "am", label: "አማርኛ", flag: "🇪🇹" },
  { value: "az", label: "Azərbaycan", flag: "🇦🇿" },
  { value: "eu", label: "Euskera", flag: "🏴" },
  { value: "be", label: "Беларуская", flag: "🇧🇾" },
  { value: "bn", label: "বাংলা", flag: "🇧🇩" },
  { value: "bs", label: "Bosanski", flag: "🇧🇦" },
  { value: "bg", label: "Български", flag: "🇧🇬" },
  { value: "ca", label: "Català", flag: "🇪🇸" },
  { value: "ceb", label: "Cebuano", flag: "🇵🇭" },
  { value: "ny", label: "Chichewa", flag: "🇲🇼" },
  { value: "co", label: "Corsu", flag: "🇫🇷" },
  { value: "hr", label: "Hrvatski", flag: "🇭🇷" },
  { value: "cs", label: "Čeština", flag: "🇨🇿" },
  { value: "da", label: "Dansk", flag: "🇩🇰" },
  { value: "nl", label: "Nederlands", flag: "🇳🇱" },
  { value: "eo", label: "Esperanto", flag: "🌍" },
  { value: "et", label: "Eesti", flag: "🇪🇪" },
  { value: "tl", label: "Filipino", flag: "🇵🇭" },
  { value: "fi", label: "Suomi", flag: "🇫🇮" },
  { value: "fy", label: "Frysk", flag: "🇳🇱" },
  { value: "gl", label: "Galego", flag: "🇪🇸" },
  { value: "ka", label: "ქართული", flag: "🇬🇪" },
  { value: "el", label: "Ελληνικά", flag: "🇬🇷" },
  { value: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
  { value: "ht", label: "Kreyòl", flag: "🇭🇹" },
  { value: "ha", label: "Hausa", flag: "🇳🇬" },
  { value: "haw", label: "ʻŌlelo Hawaiʻi", flag: "🇺🇸" },
  { value: "he", label: "עברית", flag: "🇮🇱" },
  { value: "hu", label: "Magyar", flag: "🇭🇺" },
  { value: "is", label: "Íslenska", flag: "🇮🇸" },
  { value: "ig", label: "Igbo", flag: "🇳🇬" },
  { value: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { value: "ga", label: "Gaeilge", flag: "🇮🇪" },
  { value: "jw", label: "Basa Jawa", flag: "🇮🇩" },
  { value: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
  { value: "kk", label: "Қазақ", flag: "🇰🇿" },
  { value: "km", label: "ខ្មែរ", flag: "🇰🇭" },
  { value: "rw", label: "Kinyarwanda", flag: "🇷🇼" },
  { value: "ku", label: "کوردی", flag: "🇮🇶" },
  { value: "ky", label: "Кыргызча", flag: "🇰🇬" },
  { value: "lo", label: "ລາວ", flag: "🇱🇦" },
  { value: "la", label: "Latina", flag: "🇻🇦" },
  { value: "lv", label: "Latviešu", flag: "🇱🇻" },
  { value: "lt", label: "Lietuvių", flag: "🇱🇹" },
  { value: "lb", label: "Lëtzebuergesch", flag: "🇱🇺" },
  { value: "mk", label: "Македонски", flag: "🇲🇰" },
  { value: "mg", label: "Malagasy", flag: "🇲🇬" },
  { value: "ms", label: "Bahasa Melayu", flag: "🇲🇾" },
  { value: "ml", label: "മലയാളം", flag: "🇮🇳" },
  { value: "mt", label: "Malti", flag: "🇲🇹" },
  { value: "mi", label: "Te Reo Māori", flag: "🇳🇿" },
  { value: "mr", label: "मराठी", flag: "🇮🇳" },
  { value: "mn", label: "Монгол", flag: "🇲🇳" },
  { value: "my", label: "မြန်မာ", flag: "🇲🇲" },
  { value: "ne", label: "नेपाली", flag: "🇳🇵" },
  { value: "no", label: "Norsk", flag: "🇳🇴" },
  { value: "or", label: "ଓଡ଼ିଆ", flag: "🇮🇳" },
  { value: "ps", label: "پښتو", flag: "🇦🇫" },
  { value: "fa", label: "فارسی", flag: "🇮🇷" },
  { value: "pl", label: "Polski", flag: "🇵🇱" },
  { value: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { value: "ro", label: "Română", flag: "🇷🇴" },
  { value: "sm", label: "Gagana Samoa", flag: "🇼🇸" },
  { value: "gd", label: "Gàidhlig", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { value: "sr", label: "Српски", flag: "🇷🇸" },
  { value: "st", label: "Sesotho", flag: "🇱🇸" },
  { value: "sn", label: "Shona", flag: "🇿🇼" },
  { value: "sd", label: "سنڌي", flag: "🇵🇰" },
  { value: "si", label: "සිංහල", flag: "🇱🇰" },
  { value: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { value: "sl", label: "Slovenščina", flag: "🇸🇮" },
  { value: "so", label: "Soomaali", flag: "🇸🇴" },
  { value: "su", label: "Basa Sunda", flag: "🇮🇩" },
  { value: "sw", label: "Kiswahili", flag: "🇹🇿" },
  { value: "sv", label: "Svenska", flag: "🇸🇪" },
  { value: "tg", label: "Тоҷикӣ", flag: "🇹🇯" },
  { value: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { value: "tt", label: "Татарча", flag: "🇷🇺" },
  { value: "te", label: "తెలుగు", flag: "🇮🇳" },
  { value: "th", label: "ไทย", flag: "🇹🇭" },
  { value: "tr", label: "Türkçe", flag: "🇹🇷" },
  { value: "tk", label: "Türkmençe", flag: "🇹🇲" },
  { value: "uk", label: "Українська", flag: "🇺🇦" },
  { value: "ur", label: "اردو", flag: "🇵🇰" },
  { value: "ug", label: "ئۇيغۇرچە", flag: "🇨🇳" },
  { value: "uz", label: "O'zbek", flag: "🇺🇿" },
  { value: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { value: "cy", label: "Cymraeg", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  { value: "xh", label: "isiXhosa", flag: "🇿🇦" },
  { value: "yi", label: "ייִדיש", flag: "🇮🇱" },
  { value: "yo", label: "Yorùbá", flag: "🇳🇬" },
  { value: "zu", label: "isiZulu", flag: "🇿🇦" },
]

interface LanguageSelectProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function LanguageSelect({ value, onValueChange, className }: LanguageSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedLanguage = languages.find((lang) => lang.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-card hover:bg-muted/50 border-border",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {selectedLanguage ? (
              <>
                <span className="text-lg">{selectedLanguage.flag}</span>
                <span>{selectedLanguage.label}</span>
              </>
            ) : (
              "Select language..."
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-popover border-border">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search language..." className="bg-transparent border-none" />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  key={language.value}
                  value={language.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{language.flag}</span>
                    <span>{language.label}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === language.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}