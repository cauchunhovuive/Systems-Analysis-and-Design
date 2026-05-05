from pathlib import Path
import re
path = Path('db-init/init.sql')
text = path.read_text(encoding='utf-8')
text = text.replace(
    'INSERT INTO courses (course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level)',
    'INSERT INTO courses (course_code, course_name, group_code, capacity, lecturer_name, day_of_week, start_time, end_time, level, semester)'
)
pattern = re.compile(r'VALUES \(([^)]+)\)')
def repl(m):
    vals = m.group(1).strip()
    if vals.endswith("'HK2 2025-2026'"):
        return m.group(0)
    return f"VALUES ({vals}, 'HK2 2025-2026')"
text = pattern.sub(repl, text)
path.write_text(text, encoding='utf-8')
print('updated init.sql')
