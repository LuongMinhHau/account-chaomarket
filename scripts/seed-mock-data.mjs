/**
 * Seed Mock Data for UI Testing
 * Run: node scripts/seed-mock-data.mjs
 */
import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = 'postgresql://admin:hau123@localhost:5434/account_chaomarket';
const client = new Client({ connectionString: DATABASE_URL });

async function seed() {
    await client.connect();
    console.log('🔌 Connected to database');

    // ── Check if mock products already exist ──
    const existing = await client.query("SELECT count(*) FROM product WHERE source = 'mock-seed'");
    if (parseInt(existing.rows[0].count) > 0) {
        console.log('⚠️  Mock data already exists. Skipping seed.');
        // Still print product IDs for convenience
        const prods = await client.query("SELECT id, name FROM product WHERE source = 'mock-seed' ORDER BY \"createdAt\"");
        console.log('\n📋 Existing Product IDs:');
        prods.rows.forEach((p, i) => console.log(`  ${i+1}. ${p.name?.vi || 'N/A'}: ${p.id}`));
        console.log(`\n🔗 Purchase: http://localhost:2000/purchase?productId=${prods.rows[0]?.id}&plan=pro&duration=3`);
        await client.end();
        return;
    }

    // ── 1. Insert Mock Products ──
    console.log('📦 Inserting mock products...');
    const productIds = [];

    const products = [
        {
            name: { vi: 'Gói Pro Trading Tools', en: 'Pro Trading Tools Package' },
            type: 'subscription', category: 'trading-tools',
            marketType: 'forex',
            shortDesc: { vi: 'Bộ công cụ giao dịch chuyên nghiệp với tín hiệu real-time', en: 'Professional trading tools with real-time signals' },
            desc: { vi: 'Bộ công cụ giao dịch toàn diện: Tín hiệu real-time, Phân tích kỹ thuật nâng cao, Quản lý danh mục, Bot tự động.', en: 'Complete trading toolkit: Real-time signals, Advanced TA, Portfolio management, Auto bots.' },
            resource: 'https://tools.chaomarket.com',
            instructionLink: 'https://docs.chaomarket.com/pro-trading',
            downloadLabel: { vi: 'Truy cập công cụ', en: 'Access Tools' },
            downloadLink: 'https://tools.chaomarket.com/download',
            price: '299000', discountPrice: '199000', isDiscountVisible: true,
            imageUrl: 'https://cdn-account.chaomarket.com/products/pro-trading.png',
            pinLabel: 'HOT', views: 1250, maxDevices: 3,
        },
        {
            name: { vi: 'AI Market Scanner', en: 'AI Market Scanner' },
            type: 'subscription', category: 'ai-software',
            marketType: 'crypto',
            shortDesc: { vi: 'AI quét thị trường tự động, phát hiện cơ hội đầu tư', en: 'AI-powered market scanner' },
            desc: { vi: 'AI tiên tiến quét toàn bộ thị trường crypto 24/7. Phát hiện patterns, breakouts, cơ hội tốt nhất.', en: 'Advanced AI scanning entire crypto market 24/7.' },
            resource: 'https://ai.chaomarket.com',
            instructionLink: 'https://docs.chaomarket.com/ai-scanner',
            downloadLabel: { vi: 'Mở AI Scanner', en: 'Open AI Scanner' },
            downloadLink: 'https://ai.chaomarket.com/launch',
            price: '599000', discountPrice: '449000', isDiscountVisible: true,
            imageUrl: 'https://cdn-account.chaomarket.com/products/ai-scanner.png',
            pinLabel: 'NEW', views: 890, maxDevices: 2,
        },
        {
            name: { vi: 'Khóa Học Đầu Tư Cơ Bản', en: 'Basic Investment Course' },
            type: 'course', category: 'education',
            marketType: 'stock',
            shortDesc: { vi: 'Khóa học nền tảng cho nhà đầu tư mới', en: 'Foundation course for new investors' },
            desc: { vi: '12 bài giảng video HD, tài liệu PDF, quiz kiểm tra.', en: '12 HD video lectures, PDF materials, quizzes.' },
            resource: 'https://learn.chaomarket.com',
            instructionLink: null,
            downloadLabel: { vi: 'Vào học', en: 'Start Learning' },
            downloadLink: 'https://learn.chaomarket.com/course/basic',
            price: '149000', discountPrice: null, isDiscountVisible: false,
            imageUrl: 'https://cdn-account.chaomarket.com/products/basic-course.png',
            pinLabel: null, views: 2340, maxDevices: 5,
        },
        {
            name: { vi: 'Premium News & Analysis', en: 'Premium News & Analysis' },
            type: 'subscription', category: 'news',
            marketType: null,
            shortDesc: { vi: 'Tin tức và phân tích chuyên sâu từ chuyên gia', en: 'Expert in-depth news and analysis' },
            desc: { vi: 'Truy cập không giới hạn tin tức premium, phân tích chuyên sâu, báo cáo tuần/tháng.', en: 'Unlimited premium news access with weekly and monthly reports.' },
            resource: 'https://news.chaomarket.com',
            instructionLink: null,
            downloadLabel: { vi: 'Đọc ngay', en: 'Read Now' },
            downloadLink: 'https://news.chaomarket.com/premium',
            price: '99000', discountPrice: '79000', isDiscountVisible: true,
            imageUrl: 'https://cdn-account.chaomarket.com/products/premium-news.png',
            pinLabel: 'SALE', views: 3100, maxDevices: 10,
        },
    ];

    for (const p of products) {
        const res = await client.query(`
            INSERT INTO product (
                name, type, category, "marketType", "shortDescription", description,
                resource, "instructionLink", "downloadLabel", "downloadLink",
                price, discount_price, "isDiscountPriceVisible",
                "imageUrl", "pinLabel", views, stock, max_devices, source
            ) VALUES (
                $1::jsonb, $2, $3, $4, $5::jsonb, $6::jsonb,
                $7, $8, $9::jsonb, $10,
                $11, $12, $13,
                $14, $15, $16, 999, $17, 'mock-seed'
            ) RETURNING id
        `, [
            JSON.stringify(p.name), p.type, p.category, p.marketType,
            JSON.stringify(p.shortDesc), JSON.stringify(p.desc),
            p.resource, p.instructionLink,
            JSON.stringify(p.downloadLabel), p.downloadLink,
            p.price, p.discountPrice, p.isDiscountVisible,
            p.imageUrl, p.pinLabel, p.views, p.maxDevices,
        ]);
        productIds.push(res.rows[0].id);
        console.log(`  ✅ ${p.name.vi} → ${res.rows[0].id}`);
    }

    // ── 2. Get first user ──
    const userRes = await client.query('SELECT id, name, email, phone FROM "user" LIMIT 1');
    if (userRes.rows.length === 0) {
        console.log('\n⚠️  No users found. Skipping orders/notifications.');
        printSummary(productIds, products);
        await client.end();
        return;
    }

    const user = userRes.rows[0];
    console.log(`\n👤 User: ${user.name} (${user.email})`);
    const nameParts = (user.name || 'Test User').split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // ── 3. Insert Mock Orders ──
    console.log('\n📋 Inserting mock orders...');

    const ordersData = [
        { status: 'COMPLETED', product: 0, price: '199000', discounted: true, dur: 3, plan: 'pro', txnStatus: 'COMPLETED', txnCode: '5060526001', ago: '3 days' },
        { status: 'COMPLETED', product: 2, price: '149000', discounted: false, dur: 1, plan: 'free', txnStatus: 'COMPLETED', txnCode: '3070526001', ago: '1 day' },
        { status: 'PENDING', product: 1, price: '449000', discounted: true, dur: 6, plan: 'premium', txnStatus: 'PENDING', txnCode: '2090526001', ago: '2 hours' },
        { status: 'CANCELLED', product: 3, price: '79000', discounted: true, dur: 1, plan: 'free', txnStatus: 'CANCELLED', txnCode: '4040526001', ago: '5 days' },
    ];

    for (const o of ordersData) {
        const oRes = await client.query(`
            INSERT INTO "order" ("userId", "firstName", "lastName", email, "phoneNumber", status, "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${o.ago}')
            RETURNING id
        `, [user.id, firstName, lastName, user.email, user.phone || '0901234567', o.status]);

        const origPrice = products[o.product].price;
        await client.query(`
            INSERT INTO order_product ("orderId", "productId", "purchasedName", original_price, purchased_price, "wasDiscounted", "durationMonths", plan)
            VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8)
        `, [oRes.rows[0].id, productIds[o.product], JSON.stringify(products[o.product].name), origPrice, o.price, o.discounted, o.dur, o.plan]);

        await client.query(`
            INSERT INTO transaction ("orderId", "userId", amount, currency, status, "paymentGateway", "gatewayTransactionId", "createdAt")
            VALUES ($1, $2, $3, 'VND', $4, 'PayOS', $5, NOW() - INTERVAL '${o.ago}')
        `, [oRes.rows[0].id, user.id, o.price, o.txnStatus, o.txnCode]);

        console.log(`  ✅ ${o.status}: ${products[o.product].name.vi} (${o.price} VND)`);
    }

    // ── 4. Insert Mock Notifications ──
    console.log('\n🔔 Inserting mock notifications...');
    const notifs = [
        { type: 'order', title: 'Đơn hàng hoàn tất', message: 'Đơn hàng #5060526001 (Gói Pro Trading Tools) đã được thanh toán thành công.', read: false, starred: true, ago: '3 days' },
        { type: 'order', title: 'Đơn hàng hoàn tất', message: 'Đơn hàng #3070526001 (Khóa Học Đầu Tư Cơ Bản) đã được thanh toán thành công.', read: false, starred: false, ago: '1 day' },
        { type: 'order', title: 'Đơn hàng đang chờ', message: 'Đơn hàng #2090526001 (AI Market Scanner) đang chờ thanh toán.', read: false, starred: false, ago: '2 hours' },
        { type: 'system', title: 'Chào mừng đến Chào Market!', message: 'Cảm ơn bạn đã tạo tài khoản. Khám phá sản phẩm tại Chào Market ngay hôm nay.', read: true, starred: false, ago: '7 days' },
        { type: 'security', title: 'Đăng nhập mới phát hiện', message: 'Đăng nhập mới từ Chrome trên macOS, IP: 113.161.xxx.xxx', read: true, starred: false, ago: '5 days' },
        { type: 'account', title: 'Hồ sơ đã cập nhật', message: 'Thông tin hồ sơ cá nhân của bạn đã được cập nhật thành công.', read: true, starred: false, ago: '6 days' },
        { type: 'security', title: 'Xác minh 2 bước đã bật', message: 'Bảo mật hai yếu tố (2FA) đã được kích hoạt. Hãy lưu mã dự phòng.', read: true, starred: true, ago: '4 days' },
    ];

    for (const n of notifs) {
        await client.query(`
            INSERT INTO notifications ("userId", type, title, message, "isRead", "isStarred", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '${n.ago}')
        `, [user.id, n.type, n.title, n.message, n.read, n.starred]);
    }
    console.log(`  ✅ ${notifs.length} notifications inserted`);

    // ── 5. Insert Pricing Tiers ──
    console.log('\n💰 Inserting pricing tiers...');
    const tiers = [
        { pid: 0, tier: 'monthly', dur: 1, price: '299000', disc: '199000' },
        { pid: 0, tier: 'quarterly', dur: 3, price: '799000', disc: '549000' },
        { pid: 0, tier: 'yearly', dur: 12, price: '2990000', disc: '1990000' },
        { pid: 1, tier: 'monthly', dur: 1, price: '599000', disc: '449000' },
        { pid: 1, tier: 'half-year', dur: 6, price: '2990000', disc: '2490000' },
        { pid: 1, tier: 'yearly', dur: 12, price: '5490000', disc: '3990000' },
        { pid: 3, tier: 'monthly', dur: 1, price: '99000', disc: '79000' },
        { pid: 3, tier: 'yearly', dur: 12, price: '990000', disc: '790000' },
    ];

    for (const t of tiers) {
        await client.query(`
            INSERT INTO pricing_tier ("productId", tier_name, "durationMonths", price, discount_price)
            VALUES ($1, $2, $3, $4, $5)
        `, [productIds[t.pid], t.tier, t.dur, t.price, t.disc]);
    }
    console.log(`  ✅ ${tiers.length} pricing tiers inserted`);

    // ── Summary ──
    printSummary(productIds, products);
    await client.end();
    console.log('🔌 Disconnected');
}

function printSummary(productIds, products) {
    console.log('\n═══════════════════════════════════════════');
    console.log('✅ Mock data seeded successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('\n🔗 Test URLs (http://localhost:2000):');
    console.log(`  Purchase (Pro Trading):  /purchase?productId=${productIds[0]}&plan=pro&duration=3`);
    console.log(`  Purchase (AI Scanner):   /purchase?productId=${productIds[1]}&plan=premium&duration=6`);
    console.log(`  Purchase (Course):       /purchase?productId=${productIds[2]}&plan=free&duration=1`);
    console.log(`  Purchase (News):         /purchase?productId=${productIds[3]}&plan=free&duration=1`);
    console.log(`  Order History:           /order-history`);
    console.log(`  Notifications:           /notifications`);
    console.log(`  Confirmation (success):  /checkout/confirmation?orderCode=5060526001&status=success`);
    console.log(`  Confirmation (cancel):   /checkout/confirmation?orderCode=4040526001&status=CANCELLED`);
    console.log(`  Profile:                 /profile`);
    console.log(`  Security:                /security`);
}

seed().catch(err => { console.error('❌ Seed failed:', err); process.exit(1); });
