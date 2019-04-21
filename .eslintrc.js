module.exports = {
    "parser": "babel-eslint",
    "plugins": [
        "react"
    ],
    "rules": {
        'no-console': (process.env.NODE_ENV === 'production' ? 2 : 0)
    },
    "env": {
        "es6": true,
        "browser": true,
        "node": true
    },
    "extends": [
        "eslint:recommended", 
        "plugin:react/recommended"
    ],
    "settings": {
        "react": {
            "version": "detect"
        }
    }
}
