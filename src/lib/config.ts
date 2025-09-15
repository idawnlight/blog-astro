import type { DisqusJSConfig } from "disqusjs/react/es2022";

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

interface Config {
    name: string;
    author: string;
    description: string;
    disqusJs?: Without<DisqusJSConfig, 'url'>;
}

export default {
    name: '余光的部落格',
    author: '黎明余光',
    description: 'For the next infinity.',
    disqusJs: {
        shortname: 'dawnlight',
        api: "https://idawnlight.com/api/",
        apikey: "qMzZgFvrD6nma2S9G8xjOT7OmyBNOMsv4ZC9CetPmqbq94zn8W66Zpwg7PAuJbmt",
        admin: '黎明余光',
        adminLabel: 'Admin',
    },
} as Config;