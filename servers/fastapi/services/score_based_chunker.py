import asyncio
from typing import List
import dataclasses

@dataclasses.dataclass
class TemporaryChunk:
    heading: str | None
    content: str
    heading_index: int
    score: float

class ScoreBasedChunker:

    def extract_headings(self, text: str) -> List[str]:
        lines = text.split("\n")
        return [line.strip() for line in lines if line.strip().startswith("#")]

    def score_headings(self, headings: List[str]) -> List[float]:
        heading_scores = []
        last_heading_index = -1
        first_heading_found = False

        for i, heading in enumerate(headings):
            score = 0.0
            heading_level = len(heading) - len(heading.lstrip("#"))

            if heading_level <= 3:
                score += 10.0 - (heading_level - 1) * 2.0
            else:
                score += 4.0 - (heading_level - 4) * 0.5

            if not first_heading_found:
                score += 5.0
                first_heading_found = True

            if last_heading_index != -1:
                distance = i - last_heading_index
                distance_bonus = min(5.0, distance * 0.5)
                score += distance_bonus

            last_heading_index = i
            heading_scores.append(score)

        return heading_scores

    def split_large_section(self, text: str, max_words: int = 100) -> List[TemporaryChunk]:
        """Split a long text into smaller chunks."""
        words = text.split()
        chunks = []

        for i in range(0, len(words), max_words):
            content = " ".join(words[i:i + max_words])
            chunks.append(
                TemporaryChunk(
                    heading=None,
                    content=content,
                    heading_index=-1,
                    score=0.0
                )
            )
        return chunks

    def get_chunks_from_headings(
        self,
        text: str,
        headings: List[str],
        heading_scores: List[float],
        top_k: int = 10,
        max_words_per_chunk: int = 100,
    ) -> List[TemporaryChunk]:

        if not headings:
            return self.split_large_section(text, max_words_per_chunk)

        lines = text.split("\n")
        heading_positions = {}
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            for idx, heading in enumerate(headings):
                if heading == line_stripped and idx not in heading_positions:
                    heading_positions[idx] = i
                    break

        if heading_scores:
            heading_indices = sorted(
                [(i, s) for i, s in enumerate(heading_scores) if s > 0],
                key=lambda x: (-x[1], x[0])
            )
            selected_indices = [idx for idx, _ in heading_indices[:top_k]]
            selected_indices.sort()
        else:
            selected_indices = list(range(len(headings)))

        chunks = []

        for i, heading_idx in enumerate(selected_indices):
            if heading_idx not in heading_positions:
                continue

            heading = headings[heading_idx]
            start_line = heading_positions[heading_idx]
            end_line = len(lines)

            if i + 1 < len(selected_indices):
                next_idx = selected_indices[i + 1]
                if next_idx in heading_positions:
                    end_line = heading_positions[next_idx]

            section_text = "\n".join(lines[start_line + 1:end_line]).strip()

            section_chunks = self.split_large_section(section_text, max_words_per_chunk)
            for chunk in section_chunks:
                chunk.heading = heading
                chunk.heading_index = heading_idx
                chunk.score = heading_scores[heading_idx] if heading_scores else 0.0
                chunks.append(chunk)

        return chunks

    async def get_n_chunks(self, text: str, n: int) -> List[TemporaryChunk]:
        headings = await asyncio.to_thread(self.extract_headings, text)
        heading_scores = await asyncio.to_thread(self.score_headings, headings)
        chunks = await asyncio.to_thread(
            self.get_chunks_from_headings, text, headings, heading_scores, n
        )

        if not chunks:
            chunks = await asyncio.to_thread(self.split_large_section, text, 100)

        return chunks