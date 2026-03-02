"""
任务生成器
基于种子文件和参与者ID生成可复现的随机任务
"""
import json
import random
from typing import List, Dict, Any


class TasksGenerator:
    def __init__(self, seed_file: str = "tasks_seed.json"):
        with open(seed_file, 'r', encoding='utf-8') as f:
            self.seed_data = json.load(f)
        self.templates = self.seed_data['task_templates']

    def generate_task_pool(self, participant_id: str, total_rounds: int = 8) -> List[Dict[str, Any]]:
        """
        为参与者生成完整的任务池
        使用participant_id作为随机种子，确保可复现
        """
        # 使用participant_id的哈希值作为种子
        seed = int(participant_id[:8], 16) % (2**32)
        rng = random.Random(seed)

        tasks = []
        task_id_counter = 0

        # 每轮生成1个任务（如果是bundle模式，会一次取3个）
        # 总共需要 total_rounds * 3 = 24个任务（为bundle模式准备）
        total_tasks = total_rounds * 3

        for i in range(total_tasks):
            # 随机选择任务类型
            task_type_data = rng.choice(self.templates)
            task_type = task_type_data['type']
            template = rng.choice(task_type_data['templates'])

            task = {
                'task_id': f"{participant_id}_{task_id_counter}",
                'task_type': task_type,
                'round_index': (i // 3) + 1,  # 每3个任务为一轮
                **template
            }

            tasks.append(task)
            task_id_counter += 1

        return tasks

    def generate_bundle(self, tasks: List[Dict], bundle_index: int) -> Dict[str, Any]:
        """
        生成一个任务包（3个任务）
        """
        start_idx = bundle_index * 3
        bundle_tasks = tasks[start_idx:start_idx + 3]

        return {
            'bundle_id': f"bundle_{bundle_index}",
            'tasks': bundle_tasks,
            'round_index': bundle_index + 1
        }

    def evaluate_response(self, task: Dict, response: Any) -> Dict[str, Any]:
        """
        评估任务响应
        返回：correct, score, rubric_hits等
        """
        task_type = task['task_type']

        if task_type == 'multiple_choice':
            # 选择题：检查答案索引
            correct = response.get('selected_index') == task.get('correct_index')
            return {
                'correct': 1 if correct else 0,
                'score': 1.0 if correct else 0.0,
                'rubric_hits': []
            }

        elif task_type == 'text_generation':
            # 文本生成：检查关键词命中
            text = response.get('text', '').lower()
            keywords = task.get('keywords', [])
            hits = [kw for kw in keywords if kw.lower() in text]
            score = len(hits) / len(keywords) if keywords else 0

            return {
                'correct': 1 if score >= 0.6 else 0,
                'score': score,
                'rubric_hits': hits
            }

        elif task_type == 'information_extraction':
            # 信息抽取：检查字段匹配
            fields = task.get('fields', [])
            user_answers = response.get('fields', {})
            correct_count = 0

            for field in fields:
                field_name = field['name']
                correct_answer = field['answer'].lower()
                user_answer = user_answers.get(field_name, '').lower()

                # 简单的字符串匹配（可以改进为更智能的匹配）
                if correct_answer in user_answer or user_answer in correct_answer:
                    correct_count += 1

            score = correct_count / len(fields) if fields else 0

            return {
                'correct': 1 if score >= 0.67 else 0,  # 至少2/3正确
                'score': score,
                'rubric_hits': []
            }

        return {'correct': 0, 'score': 0.0, 'rubric_hits': []}
