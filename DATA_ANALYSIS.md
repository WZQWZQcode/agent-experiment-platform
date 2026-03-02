# 数据分析指南

## 数据结构说明

### 1. Wide表（trials_wide）

每行代表一个任务试次，包含以下关键字段：

- **participant_id**: 参与者唯一标识
- **round_index**: 轮次（1-8）
- **task_id**: 任务ID
- **task_type**: 任务类型（multiple_choice, text_generation, information_extraction）
- **correct**: 是否正确（0/1）
- **score**: 得分（0-1）
- **duration_ms**: 任务完成时长（毫秒）
- **first_input_latency_ms**: 首次输入延迟（毫秒）
- **page_focus_time_ms**: 页面聚焦时间（毫秒）
- **shuffle_used**: 是否使用洗牌（0/1）
- **bundle_id**: 任务包ID
- **position_in_bundle**: 在包内的位置（0-2）
- **bundle_mode**: 实验条件-打包模式（0/1）
- **shuffle_enabled**: 实验条件-洗牌权（0/1）
- **radar_enabled**: 实验条件-雷达图（0/1）
- **metric_enabled**: 实验条件-指标绑定（0/1）

### 2. EventLog表（eventlog）

每行代表一个事件，包含：

- **participant_id**: 参与者ID
- **ts**: 时间戳（ISO8601格式）
- **event_type**: 事件类型
- **payload_json**: 事件详细信息（JSON）

事件类型包括：
- PAGE_FOCUS / PAGE_BLUR: 页面焦点变化
- TASK_VIEW: 查看任务
- FIRST_INPUT: 首次输入
- SUBMIT: 提交任务
- SHUFFLE_CLICK: 点击洗牌
- RADAR_OPEN / RADAR_CLOSE: 打开/关闭雷达图
- BUNDLE_SWITCH: 包内切换任务

## Python分析示例

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# 读取数据
wide = pd.read_csv('wide.csv')
events = pd.read_csv('eventlog.csv')

# 转换时间戳
wide['start_ts'] = pd.to_datetime(wide['start_ts'])
wide['end_ts'] = pd.to_datetime(wide['end_ts'])
events['ts'] = pd.to_datetime(events['ts'])

# ============ 基础统计 ============

# 1. 按条件分组的平均完成时间
time_by_condition = wide.groupby(['bundle_mode', 'shuffle_enabled'])['duration_ms'].mean()
print("平均完成时间（毫秒）:")
print(time_by_condition)

# 2. 按条件分组的平均得分
score_by_condition = wide.groupby(['bundle_mode', 'shuffle_enabled'])['score'].mean()
print("\n平均得分:")
print(score_by_condition)

# 3. 首次输入延迟
latency_by_condition = wide.groupby(['bundle_mode', 'shuffle_enabled'])['first_input_latency_ms'].mean()
print("\n平均首次输入延迟（毫秒）:")
print(latency_by_condition)

# ============ 高级分析 ============

# 4. 计算任务切换次数（Bundle模式）
def count_switches(participant_id):
    p_events = events[events['participant_id'] == participant_id]
    switch_events = p_events[p_events['event_type'] == 'BUNDLE_SWITCH']
    return len(switch_events)

wide['switch_count'] = wide['participant_id'].apply(count_switches)

# 5. 计算分心时间（Page Blur总时长）
def calc_distraction_time(participant_id):
    p_events = events[events['participant_id'] == participant_id]
    blur_events = p_events[p_events['event_type'] == 'PAGE_BLUR']

    total_distraction = 0
    for _, event in blur_events.iterrows():
        payload = eval(event['payload_json'])  # 注意：生产环境应使用json.loads
        total_distraction += payload.get('duration_ms', 0)

    return total_distraction

wide['distraction_time_ms'] = wide['participant_id'].apply(calc_distraction_time)

# 6. 计算雷达图查看次数
def count_radar_opens(participant_id):
    p_events = events[events['participant_id'] == participant_id]
    radar_events = p_events[p_events['event_type'] == 'RADAR_OPEN']
    return len(radar_events)

wide['radar_open_count'] = wide['participant_id'].apply(count_radar_opens)

# ============ 可视化 ============

# 7. 完成时间分布（按条件）
plt.figure(figsize=(10, 6))
sns.boxplot(data=wide, x='bundle_mode', y='duration_ms', hue='shuffle_enabled')
plt.title('Task Duration by Condition')
plt.xlabel('Bundle Mode')
plt.ylabel('Duration (ms)')
plt.legend(title='Shuffle Enabled')
plt.savefig('duration_by_condition.png')
plt.close()

# 8. 得分分布
plt.figure(figsize=(10, 6))
sns.violinplot(data=wide, x='bundle_mode', y='score', hue='shuffle_enabled')
plt.title('Score Distribution by Condition')
plt.xlabel('Bundle Mode')
plt.ylabel('Score')
plt.legend(title='Shuffle Enabled')
plt.savefig('score_by_condition.png')
plt.close()

# 9. 学习曲线（按轮次）
learning_curve = wide.groupby('round_index')['score'].mean()
plt.figure(figsize=(10, 6))
plt.plot(learning_curve.index, learning_curve.values, marker='o')
plt.title('Learning Curve')
plt.xlabel('Round')
plt.ylabel('Average Score')
plt.grid(True)
plt.savefig('learning_curve.png')
plt.close()

# ============ 统计检验 ============

from scipy import stats

# 10. t检验：Bundle vs Non-Bundle
bundle_scores = wide[wide['bundle_mode'] == 1]['score']
non_bundle_scores = wide[wide['bundle_mode'] == 0]['score']
t_stat, p_value = stats.ttest_ind(bundle_scores, non_bundle_scores)
print(f"\nBundle vs Non-Bundle t-test: t={t_stat:.3f}, p={p_value:.3f}")

# 11. 2x2 ANOVA
from scipy.stats import f_oneway

groups = wide.groupby(['bundle_mode', 'shuffle_enabled'])['score'].apply(list)
f_stat, p_value = f_oneway(*groups)
print(f"\n2x2 ANOVA: F={f_stat:.3f}, p={p_value:.3f}")

# ============ 导出聚合数据 ============

# 12. 参与者级别聚合
participant_summary = wide.groupby('participant_id').agg({
    'score': 'mean',
    'duration_ms': 'mean',
    'first_input_latency_ms': 'mean',
    'shuffle_used': 'sum',
    'bundle_mode': 'first',
    'shuffle_enabled': 'first'
}).reset_index()

participant_summary.to_csv('participant_summary.csv', index=False)
print("\n参与者级别聚合数据已保存到 participant_summary.csv")
```

## R分析示例

```r
library(tidyverse)
library(lme4)
library(ggplot2)

# 读取数据
wide <- read_csv('wide.csv')
events <- read_csv('eventlog.csv')

# 基础统计
wide %>%
  group_by(bundle_mode, shuffle_enabled) %>%
  summarise(
    mean_score = mean(score),
    mean_duration = mean(duration_ms),
    mean_latency = mean(first_input_latency_ms)
  )

# 混合效应模型
model <- lmer(score ~ bundle_mode * shuffle_enabled + round_index +
              (1 | participant_id), data = wide)
summary(model)

# 可视化
ggplot(wide, aes(x = factor(bundle_mode), y = score, fill = factor(shuffle_enabled))) +
  geom_boxplot() +
  labs(title = "Score by Condition", x = "Bundle Mode", y = "Score") +
  theme_minimal()
```

## 关键指标定义

1. **Initiation Latency**: 首次输入延迟，反映任务启动速度
2. **Switch Count**: 任务切换次数（Bundle模式），反映任务选择行为
3. **Distraction Time**: 分心时间（Page Blur总时长），反映注意力集中度
4. **Radar Usage**: 雷达图查看次数和时长，反映信息寻求行为
5. **Completion Rate**: 完成率，反映任务难度和动机
6. **Learning Effect**: 学习效应（按轮次的得分变化），反映技能提升

## 研究问题示例

1. **H1**: Bundle模式会降低任务切换成本，提高整体效率
   - 分析：比较bundle_mode=1和0的duration_ms和score

2. **H2**: Shuffle权会增加控制感，降低压力
   - 分析：比较shuffle_enabled=1和0的survey数据（stress, control）

3. **H3**: Radar透明度会增加信息寻求行为
   - 分析：统计radar_open_count和停留时长

4. **H4**: Metric绑定会提高速度但增加压力
   - 分析：比较metric_enabled=1和0的duration_ms和stress

## 注意事项

1. 所有时间戳为UTC时间，分析时注意时区转换
2. EventLog中的payload_json需要解析为字典/对象
3. 参与者级别分析时注意聚合方法（mean, sum, first等）
4. 统计检验前检查数据分布和方差齐性
5. 多重比较时注意校正p值（Bonferroni, FDR等）
