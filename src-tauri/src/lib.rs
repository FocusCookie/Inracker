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
                players TEXT
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create players table",
            sql: "CREATE TABLE IF NOT EXISTS players(
                armor INTEGER,
                attributes INTEGER, -- attributes id
                class_sg INTEGER,
                description TEXT,
                effects STRING, -- JSON array ids
                ep INTEGER,
                health INTEGER,
                max_health INTEGER,
                image TEXT,
                icon TEXT NOT NULL,
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                immunities TEXT, -- JSON array ids
                level INTEGER,
                movement TEXT, -- JSON string: Object air, ground, water, high_jump, wide_jump
                name TEXT NOT NULL,
                perception NUMBER,
                resistances TEXT, --JSON array ids
                role TEXT,
                saving_throws TEXT, -- JSON string: reflex, will, thoughness
                shield STRING, -- JSON string: value, health
                skills INTEGER -- skills id
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
            description: "create attributes table",
            sql: "CREATE TABLE IF NOT EXISTS attributes (
                constitution INTEGER NOT NULL,
                charisma INTEGER NOT NULL,
                dexterity INTEGER NOT NULL,
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                intelligence INTEGER NOT NULL,
                player INTEGER,
                strength INTEGER NOT NULL,
                wisdom INTEGER NOT NULL
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 6,
            description: "create skills table",
            sql: "CREATE TABLE IF NOT EXISTS skills (
                acrobatics INTEGER NOT NULL,
                arcane INTEGER NOT NULL,
                athletics INTEGER NOT NULL,
                craftmanship INTEGER NOT NULL,
                custom_1 INTEGER NOT NULL,
                custom_2 INTEGER NOT NULL,
                deception INTEGER NOT NULL,
                diplomacy INTEGER NOT NULL,
                healing INTEGER NOT NULL,
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                intimidation INTEGER NOT NULL,
                nature INTEGER NOT NULL,
                occultism INTEGER NOT NULL,
                performance INTEGER NOT NULL,
                player INTEGER NOT NULL,
                religion INTEGER NOT NULL,
                social INTEGER NOT NULL,
                stealth INTEGER NOT NULL,
                survival INTEGER NOT NULL,
                thievery INTEGER NOT NULL
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 7,
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
            version: 8,
            description: "create chapters table",
            sql: "CREATE TABLE IF NOT EXISTS chapters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                image TEXT,
                icon TEXT NOT NULL,
                experience INTEGER,
                state TEXT NOT NULL,
                battlemap TEXT, -- url to img
                tokens TEXT, -- JSON array of player tokens and opponent tokens
                encounter TEXT -- JSON array of id of encounter
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 9,
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
            )",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 10,
            description: "create opponents table",
            sql: "CREATE TABLE IF NOT EXISTS opponents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                image TEXT,
                icon TEXT NOT NULL,
                level INTEGER,
                labels STRING -- JSON ARRAY of strings
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
