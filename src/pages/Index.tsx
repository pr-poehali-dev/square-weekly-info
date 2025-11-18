import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const START_DATE = new Date('1986-06-05');

const getWeeksSinceStart = () => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - START_DATE.getTime());
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
};

const getDateForWeek = (weekNumber: number) => {
  const date = new Date(START_DATE);
  date.setDate(date.getDate() + (weekNumber * 7));
  return date;
};

const formatDateRange = (weekNumber: number) => {
  const startDate = getDateForWeek(weekNumber);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${startDate.toLocaleDateString('ru-RU', options)} - ${endDate.toLocaleDateString('ru-RU', options)}`;
};

interface WeekData {
  weekNumber: number;
  content: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showWeekDialog, setShowWeekDialog] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [weekContent, setWeekContent] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [weeksData, setWeeksData] = useState<Record<number, string>>({});
  
  const totalWeeks = getWeeksSinceStart();

  useEffect(() => {
    const savedData = localStorage.getItem('weeksData');
    if (savedData) {
      setWeeksData(JSON.parse(savedData));
    }
  }, []);

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      toast.success('Вход выполнен');
      setUsername('');
      setPassword('');
    } else {
      toast.error('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    toast.info('Выход выполнен');
  };

  const handleWeekClick = (weekNumber: number) => {
    setSelectedWeek(weekNumber);
    setWeekContent(weeksData[weekNumber] || '');
    setShowWeekDialog(true);
  };

  const handleSaveWeek = () => {
    if (selectedWeek !== null) {
      const newData = { ...weeksData, [selectedWeek]: weekContent };
      setWeeksData(newData);
      localStorage.setItem('weeksData', JSON.stringify(newData));
      toast.success('Неделя сохранена');
      setShowWeekDialog(false);
    }
  };

  const hasContent = (weekNumber: number) => {
    return weeksData[weekNumber] && weeksData[weekNumber].trim().length > 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Жизнь в неделях
          </h1>
          
          {isAuthenticated ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <Icon name="LogOut" size={16} />
              Выход
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowLoginDialog(true)}
              className="gap-2"
            >
              <Icon name="Lock" size={16} />
              Вход
            </Button>
          )}
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-muted-foreground text-sm">
              С 5 июня 1986 года прошло {totalWeeks.toLocaleString('ru-RU')} недель
            </p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(12px,12px))] gap-1 justify-center">
            {Array.from({ length: totalWeeks }, (_, i) => {
              const reversedIndex = totalWeeks - 1 - i;
              return (
                <button
                  key={reversedIndex}
                  onClick={() => handleWeekClick(reversedIndex)}
                  className={`
                    w-3 h-3 rounded-sm transition-all duration-200 
                    hover:scale-125 hover:shadow-lg
                    ${hasContent(reversedIndex) 
                      ? 'bg-accent hover:bg-accent/80' 
                      : 'bg-secondary hover:bg-muted'
                    }
                  `}
                  title={formatDateRange(reversedIndex)}
                />
              );
            })}
          </div>
        </div>
      </main>

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вход в систему</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleLogin} className="w-full">
              Войти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWeekDialog} onOpenChange={setShowWeekDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Неделя {selectedWeek !== null ? selectedWeek + 1 : ''}
            </DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">
              {selectedWeek !== null && formatDateRange(selectedWeek)}
            </p>
          </DialogHeader>
          <div className="py-4">
            {isAuthenticated ? (
              <Textarea
                value={weekContent}
                onChange={(e) => setWeekContent(e.target.value)}
                placeholder="Опишите события этой недели..."
                className="min-h-[200px] resize-none"
              />
            ) : (
              <div className="min-h-[200px] p-4 rounded-md border bg-muted/50">
                {weekContent ? (
                  <p className="text-sm whitespace-pre-wrap">{weekContent}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Нет записей для этой недели
                  </p>
                )}
              </div>
            )}
          </div>
          {isAuthenticated && (
            <DialogFooter>
              <Button onClick={handleSaveWeek}>
                Сохранить
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;