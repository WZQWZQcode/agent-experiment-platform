/**
 * 主应用组件
 * 管理应用状态和页面路由
 */
import React, { useState, useEffect } from 'react';
import { Welcome } from './pages/Welcome';
import { TaskArena } from './pages/TaskArena';
import { Survey } from './pages/Survey';
import { Finish } from './pages/Finish';
import { Admin } from './pages/Admin';
import { api } from './api';
import { Condition } from './types';

type AppState = 'welcome' | 'task' | 'survey' | 'finish';

function App() {
  const [state, setState] = useState<AppState>('welcome');
  const [participantId, setParticipantId] = useState<string>('');
  const [condition, setCondition] = useState<Condition | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [showAdmin, setShowAdmin] = useState(false);

  // 监听管理面板快捷键 Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdmin(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStart = async (pid: string) => {
    setParticipantId(pid);

    // 获取实验条件
    try {
      const result = await api.assignCondition(pid);
      setCondition(result.conditions);
      setState('task');
    } catch (error) {
      console.error('Failed to assign condition:', error);
      alert('初始化失败，请刷新页面重试');
    }
  };

  const handleRoundComplete = (roundIndex: number) => {
    setCurrentRound(roundIndex);
    setState('survey');
  };

  const handleSurveyComplete = () => {
    // 检查是否完成所有轮次
    if (currentRound >= 8) {
      api.completeExperiment(participantId);
      setState('finish');
    } else {
      setState('task');
    }
  };

  const handleAllComplete = () => {
    api.completeExperiment(participantId);
    setState('finish');
  };

  return (
    <>
      {state === 'welcome' && <Welcome onStart={handleStart} />}

      {state === 'task' && condition && (
        <TaskArena
          participantId={participantId}
          condition={condition}
          onRoundComplete={handleRoundComplete}
          onAllComplete={handleAllComplete}
        />
      )}

      {state === 'survey' && (
        <Survey
          participantId={participantId}
          roundIndex={currentRound}
          onComplete={handleSurveyComplete}
        />
      )}

      {state === 'finish' && <Finish participantId={participantId} />}

      {showAdmin && <Admin onClose={() => setShowAdmin(false)} />}
    </>
  );
}

export default App;
