use std::env;
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let vite_env = env::var("VITE_ENV").unwrap_or_else(|_| String::from("inracker_dev"));
    let db_name = format!("sqlite:{}.db", vite_env);

    let migrations = vec![
        Migration {
            version: 1,
            description: "create parties table",
            sql: "CREATE TABLE IF NOT EXISTS parties(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT NOT NULL,
                players TEXT -- JSON array ids
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create players table",
            sql: "CREATE TABLE IF NOT EXISTS players(
                details TEXT,
                effects TEXT, -- JSON array ids
                ep INTEGER,
                health INTEGER,
                max_health INTEGER,
                image TEXT,
                icon TEXT NOT NULL,
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                immunities TEXT, -- JSON array ids
                level INTEGER,
                name TEXT NOT NULL,
                overview TEXT,
                resistances TEXT, --JSON array ids
                role TEXT
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create effects table",
            sql: "CREATE TABLE IF NOT EXISTS effects(
                description TEXT,
                damage INTEGER, 
                duration INTEGER, 
                duration_type TEXT NOT NULL,
                icon TEXT NOT NULL,
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "create immunities table",
            sql: "CREATE TABLE IF NOT EXISTS immunities(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT NOT NULL
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "create resistances table",
            sql: "CREATE TABLE IF NOT EXISTS resistances (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT NOT NULL
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create chapters table",
            sql: "CREATE TABLE IF NOT EXISTS chapters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                party INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                icon TEXT NOT NULL,
                state TEXT NOT NULL,
                battlemap TEXT, -- url to img
                tokens TEXT, -- JSON array of player tokens and opponent tokens
                encounters TEXT -- JSON array of id of encounter
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
            description: "create encounter table",
            sql: "CREATE TABLE IF NOT EXISTS encounter (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                image TEXT,
                icon TEXT NOT NULL,
                color TEXT NOT NULL,
                type TEXT NOT NULL, -- roll / fight / note
                experience INTEGER,
                state TEXT NOT NULL,
                dice INTEGER,
                skill INTEGER,
                difficulty INTEGER,
                opponents TEXT -- JSON array of ids of opponents
                ep INTEGER
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 8,
            description: "create opponents table",
            sql: "CREATE TABLE IF NOT EXISTS opponents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                image TEXT,
                icon TEXT NOT NULL,
                level INTEGER,
                labels TEXT -- JSON ARRAY of strings
                ep INTEGER NOT NULL
            )",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(&db_name, migrations)
                .build(),
        )
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
