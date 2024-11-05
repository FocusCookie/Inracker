use tauri_plugin_sql::{Migration, MigrationKind};
use std::env; 

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
                players TEXT,
                state TEXT
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create players table",
            sql: "CREATE TABLE IF NOT EXISTS players(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                icon TEXT NOT NULL,
                image TEXT,
                notes TEXT,
                armor INTEGER,
                classSg INTEGER,
                movement TEXT, -- JSON string: Object air, ground, water, high_jump, wide_jump
                immunities TEXT, -- JSON array ids
                debuffs TEXT, -- JSON array ids
                buffs TEXT, -- JSON array ids
                harmful_effects TEXT, -- JSON array ids
                health INTEGER,
                level INTEGER,
                saving_throws TEXT -- JSON string: reflex, will, thoughness
                thoughness INTEGER,
                shield -- JSON string: value, health,
                skills -- JSON object,
                attributes -- JSON object
            )",
            kind: MigrationKind::Up,
        }
    ];
    
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(&db_name, migrations)  
                .build()
        )
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}