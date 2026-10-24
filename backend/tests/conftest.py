"""Test environment: a throwaway database built by the real migrations.

The settings are fixed before any test module imports the app, so the suite never touches the
development database (arthayukti.db) and never depends on create_all.
"""

import os
import tempfile
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
_workdir = tempfile.mkdtemp(prefix="arthayukti-tests-")

os.environ["DATABASE_URL"] = f"sqlite:///{(Path(_workdir) / 'test.db').as_posix()}"
os.environ["ENVIRONMENT"] = "test"
os.environ["SECRET_KEY"] = "test-signing-key-" + "k" * 40
os.environ["RATE_LIMIT_ENABLED"] = "false"
os.environ["MAIL_BACKEND"] = "memory"
os.environ["SEED_DEMO_USER"] = "false"

from alembic.config import Config  # noqa: E402

from alembic import command  # noqa: E402

_config = Config(str(BACKEND / "alembic.ini"))
_config.set_main_option("script_location", str(BACKEND / "alembic"))
command.upgrade(_config, "head")
