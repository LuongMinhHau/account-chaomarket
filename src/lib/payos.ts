import { PayOS } from '@payos/node';

let _payos: PayOS | null = null;

function getPayOS(): PayOS {
    if (!_payos) {
        _payos = new PayOS({
            clientId: process.env.PAYOS_CLIENT_ID!,
            apiKey: process.env.PAYOS_API_KEY!,
            checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
        });
    }
    return _payos;
}

// Use a Proxy so the PayOS client is only created when actually used at runtime,
// not during Next.js static analysis / build phase
const payos = new Proxy({} as PayOS, {
    get(_target, prop) {
        const value = Reflect.get(getPayOS(), prop);
        if (typeof value === 'function') {
            return value.bind(getPayOS());
        }
        return value;
    },
});

export default payos;
