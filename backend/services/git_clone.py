import os
import subprocess
import tempfile
import shutil
from urllib.parse import urlparse
from pathlib import Path
from typing import Optional, Tuple

from core.logging import server_log, server_error

# Path to data/projects/
BASE_PROJECT_PATH = Path(__file__).parents[2] / "data" / "projects"


def extract_project_name_from_url(url: str) -> str:
    parsed = urlparse(url)
    return os.path.splitext(os.path.basename(parsed.path))[0]


def is_project_existing(project_name: str) -> bool:
    return (BASE_PROJECT_PATH / project_name / "repo").exists()


def clone_repo(repo_url: str, project_name: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str]]:
    try:
        project_name = project_name or extract_project_name_from_url(repo_url)
        final_repo_path = BASE_PROJECT_PATH / project_name / "repo"

        if final_repo_path.exists():
            return False, project_name, f"Project '{project_name}' already exists."

        server_log(f"[clone_repo] Cloning {repo_url} into temporary directory")

        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_repo_path = Path(tmpdir) / "repo"

            subprocess.run(
                ["git", "clone", repo_url, str(tmp_repo_path)],
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )

            server_log(f"[clone_repo] Clone successful. Copying to {final_repo_path}")

            # Copy contents to final destination (more robust than move)
            shutil.copytree(tmp_repo_path, final_repo_path)

        return True, project_name, None

    except subprocess.CalledProcessError as e:
        stderr = e.stderr.strip()
        server_error("[clone_repo] Git clone failed", stderr)
        return False, None, f"Git clone error: {stderr}"

    except Exception as e:
        server_error("[clone_repo] Unexpected error", e)
        return False, None, str(e)
