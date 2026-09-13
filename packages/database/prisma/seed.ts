import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

async function main() {
  console.log('🌱 Seeding QueueLess database...\n');

  // Clean existing data for clean idempotent re-seeding
  await prisma.auditLog.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.counterTicket.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.staffMembership.deleteMany();
  await prisma.counter.deleteMany();
  await prisma.user.deleteMany();
  await prisma.shop.deleteMany();

  // ---- Shop ----
  const shop = await prisma.shop.create({
    data: {
      name: 'Sri Lakshmi Tea & Snacks',
      slug: 'sri-lakshmi-tea',
      description: 'Tea • Coffee • Snacks • Juices • Cakes • Ice Creams • Hot Food',
      status: 'OPEN',
      openTime: '06:00',
      closeTime: '22:00',
      onlinePaymentEnabled: true,
      cashPaymentEnabled: true,
      taxPercent: 5.0,
      orderPrefix: 'A',
      dailyOrderSeq: 100,
      lastOrderDate: '',
    },
  });
  console.log(`✅ Shop: ${shop.name} (${shop.slug})`);

  // ---- Counters ----
  const teaCounter = await prisma.counter.create({
    data: { shopId: shop.id, name: 'Tea Counter', code: 'TEA', isActive: true },
  });
  const snacksCounter = await prisma.counter.create({
    data: { shopId: shop.id, name: 'Snacks Counter', code: 'SNK', isActive: true },
  });
  const juiceCounter = await prisma.counter.create({
    data: { shopId: shop.id, name: 'Juice & Dessert Counter', code: 'JIC', isActive: true },
  });
  const foodCounter = await prisma.counter.create({
    data: { shopId: shop.id, name: 'Food Counter', code: 'FOOD', isActive: true },
  });
  console.log(`✅ Counters: Tea, Snacks, Juice & Dessert, Food`);

  // ---- Categories ----
  const categories: Record<string, string> = {};
  const catData = [
    { name: 'Tea & Coffee', slug: 'tea-coffee', sortOrder: 0 },
    { name: 'Snacks', slug: 'snacks', sortOrder: 1 },
    { name: 'Juices', slug: 'juices', sortOrder: 2 },
    { name: 'Cakes', slug: 'cakes', sortOrder: 3 },
    { name: 'Ice Creams', slug: 'ice-creams', sortOrder: 4 },
    { name: 'Food', slug: 'food', sortOrder: 5 },
    { name: 'Cool Drinks', slug: 'cool-drinks', sortOrder: 6 },
    { name: 'Bakery', slug: 'bakery', sortOrder: 7 },
    { name: 'Other', slug: 'other', sortOrder: 8 },
  ];

  for (const c of catData) {
    const cat = await prisma.category.create({
      data: { shopId: shop.id, ...c, isActive: true },
    });
    categories[c.slug] = cat.id;
  }
  console.log(`✅ Categories: ${catData.map((c) => c.name).join(', ')}`);

  // ---- Products ----
  const products = [
    // --- Tea & Coffee ---
    { name: 'Tea', description: 'Freshly brewed hot milk tea', price: 15, categoryId: categories['tea-coffee'], counterId: teaCounter.id, sortOrder: 0 },
    { name: 'Masala Tea', description: 'Spiced Indian chai with cloves, ginger & cardamom', price: 20, categoryId: categories['tea-coffee'], counterId: teaCounter.id, sortOrder: 1 },
    { name: 'Coffee', description: 'Fresh hot brewed coffee', price: 25, categoryId: categories['tea-coffee'], counterId: teaCounter.id, sortOrder: 2 },
    { name: 'Filter Coffee', description: 'Traditional South Indian chicory filter coffee', price: 25, categoryId: categories['tea-coffee'], counterId: teaCounter.id, sortOrder: 3 },
    { name: 'Ginger Tea', description: 'Hot tea with freshly crushed ginger', price: 20, categoryId: categories['tea-coffee'], counterId: teaCounter.id, sortOrder: 4 },
    { name: 'Cardamom Tea', description: 'Fragrant elaichi tea with fresh milk', price: 20, categoryId: categories['tea-coffee'], counterId: teaCounter.id, sortOrder: 5 },

    // --- Snacks ---
    { name: 'Samosa', description: 'Crispy golden potato & peas samosa (1 pc)', price: 15, categoryId: categories['snacks'], counterId: snacksCounter.id, sortOrder: 0 },
    { name: 'Bajji', description: 'Hot onion & mirchi bajji (2 pcs)', price: 12, categoryId: categories['snacks'], counterId: snacksCounter.id, sortOrder: 1 },
    { name: 'Vada', description: 'Crispy South Indian medu vada (1 pc)', price: 12, categoryId: categories['snacks'], counterId: snacksCounter.id, sortOrder: 2 },
    { name: 'Veg Puff', description: 'Flaky baked vegetable puff', price: 20, categoryId: categories['snacks'], counterId: snacksCounter.id, sortOrder: 3 },
    { name: 'Banana Chips', description: 'Crispy salted Kerala raw banana chips (100g pack)', price: 25, categoryId: categories['snacks'], counterId: snacksCounter.id, sortOrder: 4 },
    { name: 'Masala Vada', description: 'Crunchy spiced chana dal patties (2 pcs)', price: 15, categoryId: categories['snacks'], counterId: snacksCounter.id, sortOrder: 5 },

    // --- Juices ---
    { name: 'Lime Juice', description: 'Freshly squeezed lime juice with mint', price: 30, categoryId: categories['juices'], counterId: juiceCounter.id, sortOrder: 0 },
    { name: 'Orange Juice', description: 'Pure sweet fresh orange juice', price: 50, categoryId: categories['juices'], counterId: juiceCounter.id, sortOrder: 1 },
    { name: 'Watermelon Juice', description: 'Hydrating fresh watermelon juice', price: 45, categoryId: categories['juices'], counterId: juiceCounter.id, sortOrder: 2 },
    { name: 'Mango Juice', description: 'Thick seasonal Alphonso mango juice', price: 55, categoryId: categories['juices'], counterId: juiceCounter.id, sortOrder: 3 },
    { name: 'Pineapple Juice', description: 'Sweet and tangy fresh pineapple juice', price: 50, categoryId: categories['juices'], counterId: juiceCounter.id, sortOrder: 4 },

    // --- Cakes ---
    { name: 'Chocolate Cake', description: 'Rich Belgian chocolate fudge pastry slice', price: 80, categoryId: categories['cakes'], counterId: juiceCounter.id, sortOrder: 0 },
    { name: 'Black Forest Cake', description: 'Layered cherry and chocolate cream pastry slice', price: 90, categoryId: categories['cakes'], counterId: juiceCounter.id, sortOrder: 1 },
    { name: 'Plum Cake', description: 'Traditional fruit and nut cake slice', price: 60, categoryId: categories['cakes'], counterId: snacksCounter.id, sortOrder: 2 },

    // --- Ice Creams ---
    { name: 'Vanilla', description: 'Creamy Madagascar vanilla bean ice cream scoop', price: 40, categoryId: categories['ice-creams'], counterId: juiceCounter.id, sortOrder: 0 },
    { name: 'Chocolate', description: 'Rich dark chocolate ice cream scoop', price: 50, categoryId: categories['ice-creams'], counterId: juiceCounter.id, sortOrder: 1 },
    { name: 'Butterscotch', description: 'Caramel crunch butterscotch scoop', price: 50, categoryId: categories['ice-creams'], counterId: juiceCounter.id, sortOrder: 2 },
    { name: 'Kulfi', description: 'Traditional slow-cooked malai kulfi stick', price: 45, categoryId: categories['ice-creams'], counterId: juiceCounter.id, sortOrder: 3 },

    // --- Food ---
    { name: 'Veg Sandwich', description: 'Toasted sandwich with cucumber, tomato and potato', price: 60, categoryId: categories['food'], counterId: foodCounter.id, sortOrder: 0 },
    { name: 'Paneer Sandwich', description: 'Spiced paneer filling in toasted golden bread', price: 80, categoryId: categories['food'], counterId: foodCounter.id, sortOrder: 1 },
    { name: 'Maggi', description: 'Classic masala noodles cooked with butter & veggies', price: 45, categoryId: categories['food'], counterId: foodCounter.id, sortOrder: 2 },
    { name: 'Bread Omelette', description: 'Double egg fluffy masala omelette wrapped in bread', price: 40, categoryId: categories['food'], counterId: foodCounter.id, sortOrder: 3 },
    { name: 'Cheese Maggi', description: 'Cheesy masala Maggi topped with melted mozzarella', price: 60, categoryId: categories['food'], counterId: foodCounter.id, sortOrder: 4 },

    // --- Cool Drinks ---
    { name: 'Coke', description: 'Chilled Coca-Cola can (300ml)', price: 40, categoryId: categories['cool-drinks'], counterId: juiceCounter.id, sortOrder: 0 },
    { name: 'Sprite', description: 'Chilled Sprite can (300ml)', price: 40, categoryId: categories['cool-drinks'], counterId: juiceCounter.id, sortOrder: 1 },
    { name: 'Thums Up', description: 'Chilled Thums Up bottle (250ml)', price: 40, categoryId: categories['cool-drinks'], counterId: juiceCounter.id, sortOrder: 2 },

    // --- Bakery ---
    { name: 'Bread', description: 'Fresh whole wheat sliced loaf (400g)', price: 40, categoryId: categories['bakery'], counterId: snacksCounter.id, sortOrder: 0 },
    { name: 'Bun', description: 'Soft sweet bakery bun (1 pc)', price: 20, categoryId: categories['bakery'], counterId: snacksCounter.id, sortOrder: 1 },
    { name: 'Butter Bun', description: 'Soft bun with creamy butter and sugar filling', price: 25, categoryId: categories['bakery'], counterId: snacksCounter.id, sortOrder: 2 },

    // --- Other ---
    { name: 'Mineral Water', description: 'Packaged drinking water bottle (1L)', price: 20, categoryId: categories['other'], counterId: snacksCounter.id, sortOrder: 0 },
    { name: 'Butter Biscuit', description: 'Crispy fresh butter bakery biscuits (4 pcs)', price: 10, categoryId: categories['other'], counterId: snacksCounter.id, sortOrder: 1 },
  ];

  const createdProducts: Record<string, any> = {};
  for (const p of products) {
    const prod = await prisma.product.create({
      data: { shopId: shop.id, ...p, availability: 'AVAILABLE', maxQuantity: 20 },
    });
    createdProducts[p.name] = prod;
  }
  console.log(`✅ Products: ${products.length} items across ${catData.length} categories`);

  // ---- Users & Staff ----
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@queueless.local',
      name: 'QueueLess Admin',
      passwordHash: hashPassword('QueueLess@123'),
    },
  });

  const owner = await prisma.user.create({
    data: {
      email: 'owner@srilakshmi.com',
      name: 'Lakshmi',
      passwordHash: hashPassword('QueueLess@123'),
    },
  });

  const billingUser = await prisma.user.create({
    data: {
      email: 'billing@srilakshmi.com',
      name: 'Ravi (Billing)',
      passwordHash: hashPassword('QueueLess@123'),
    },
  });

  const teaStaff = await prisma.user.create({
    data: {
      email: 'tea@srilakshmi.com',
      name: 'Kumar (Tea)',
      passwordHash: hashPassword('QueueLess@123'),
    },
  });

  const snacksStaff = await prisma.user.create({
    data: {
      email: 'snacks@srilakshmi.com',
      name: 'Priya (Snacks)',
      passwordHash: hashPassword('QueueLess@123'),
    },
  });

  await prisma.staffMembership.create({ data: { userId: adminUser.id, shopId: shop.id, role: 'OWNER' } });
  await prisma.staffMembership.create({ data: { userId: owner.id, shopId: shop.id, role: 'OWNER' } });
  await prisma.staffMembership.create({ data: { userId: billingUser.id, shopId: shop.id, role: 'BILLING' } });
  await prisma.staffMembership.create({ data: { userId: teaStaff.id, shopId: shop.id, role: 'COUNTER_STAFF', counterId: teaCounter.id } });
  await prisma.staffMembership.create({ data: { userId: snacksStaff.id, shopId: shop.id, role: 'COUNTER_STAFF', counterId: snacksCounter.id } });
  console.log(`✅ Staff: QueueLess Admin (admin@queueless.local), Owner, Billing, Tea, Snacks`);

  // ---- Sample Orders for Dashboard ----
  const today = new Date().toISOString().split('T')[0];
  const sampleOrders = [
    {
      orderNumber: 'A101',
      status: 'COMPLETED',
      paymentMethod: 'ONLINE',
      items: [
        { product: createdProducts['Tea'], qty: 2 },
        { product: createdProducts['Samosa'], qty: 2 },
      ],
    },
    {
      orderNumber: 'A102',
      status: 'COMPLETED',
      paymentMethod: 'CASH',
      items: [
        { product: createdProducts['Filter Coffee'], qty: 1 },
        { product: createdProducts['Bajji'], qty: 3 },
      ],
    },
    {
      orderNumber: 'A103',
      status: 'CONFIRMED',
      paymentMethod: 'ONLINE',
      items: [
        { product: createdProducts['Masala Tea'], qty: 3 },
        { product: createdProducts['Veg Sandwich'], qty: 1 },
      ],
    },
    {
      orderNumber: 'A104',
      status: 'CASH_PENDING',
      paymentMethod: 'CASH',
      items: [
        { product: createdProducts['Lime Juice'], qty: 2 },
        { product: createdProducts['Vada'], qty: 4 },
      ],
    },
  ];

  for (const so of sampleOrders) {
    let subtotal = 0;
    const orderItems: any[] = [];
    for (const item of so.items) {
      const totalPrice = item.product.price * item.qty;
      subtotal += totalPrice;
      orderItems.push({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.qty,
        unitPrice: item.product.price,
        totalPrice,
        counterId: item.product.counterId,
        counterName:
          item.product.counterId === teaCounter.id
            ? 'Tea Counter'
            : item.product.counterId === snacksCounter.id
            ? 'Snacks Counter'
            : item.product.counterId === juiceCounter.id
            ? 'Juice & Dessert Counter'
            : 'Food Counter',
      });
    }

    const order = await prisma.order.create({
      data: {
        shopId: shop.id,
        orderNumber: so.orderNumber,
        status: so.status,
        paymentMethod: so.paymentMethod,
        subtotal,
        taxAmount: Math.round(subtotal * 0.05 * 100) / 100,
        total: subtotal + Math.round(subtotal * 0.05 * 100) / 100,
        items: { create: orderItems },
      },
    });

    // Create payment records
    const paymentStatus = so.status === 'CASH_PENDING' ? 'PENDING' : 'SUCCESS';
    await prisma.payment.create({
      data: {
        orderId: order.id,
        shopId: shop.id,
        method: so.paymentMethod,
        status: paymentStatus,
        amount: order.total,
      },
    });

    // Create counter tickets
    const counterGroups = new Map<string, boolean>();
    for (const item of orderItems) {
      if (!counterGroups.has(item.counterId)) {
        counterGroups.set(item.counterId, true);
        const ticketStatus = so.status === 'COMPLETED' ? 'READY' : so.status === 'CONFIRMED' ? 'PENDING' : 'PENDING';
        await prisma.counterTicket.create({
          data: {
            orderId: order.id,
            counterId: item.counterId,
            status: ticketStatus,
          },
        });
      }
    }

    // Status history
    await prisma.orderStatusHistory.create({
      data: { orderId: order.id, fromStatus: null, toStatus: 'PENDING', note: 'Order created' },
    });
    if (so.status !== 'PENDING' && so.status !== 'CASH_PENDING') {
      await prisma.orderStatusHistory.create({
        data: { orderId: order.id, fromStatus: 'PENDING', toStatus: 'CONFIRMED', note: 'Payment confirmed' },
      });
    }
    if (so.status === 'COMPLETED') {
      await prisma.orderStatusHistory.create({
        data: { orderId: order.id, fromStatus: 'CONFIRMED', toStatus: 'COMPLETED', note: 'Order completed' },
      });
    }
  }

  // Update daily seq
  await prisma.shop.update({
    where: { id: shop.id },
    data: { dailyOrderSeq: 104, lastOrderDate: today },
  });

  console.log(`✅ Sample orders: ${sampleOrders.length} orders`);

  // ---- Second shop for tenant isolation testing ----
  const shop2 = await prisma.shop.create({
    data: {
      name: 'Annapoorna Sweets',
      slug: 'annapoorna-sweets',
      description: 'Sweets • Snacks • Tiffin',
      status: 'OPEN',
      orderPrefix: 'B',
      dailyOrderSeq: 0,
      lastOrderDate: '',
    },
  });
  const owner2 = await prisma.user.create({
    data: { email: 'owner@annapoorna.com', name: 'Owner Annapoorna', passwordHash: hashPassword('QueueLess@123') },
  });
  await prisma.staffMembership.create({ data: { userId: owner2.id, shopId: shop2.id, role: 'OWNER' } });
  console.log(`✅ Tenant test shop: ${shop2.name}`);

  console.log('\n🎉 Seed complete!\n');
  console.log('DEVELOPMENT LOGIN CREDENTIALS:');
  console.log('  Email:    admin@queueless.local');
  console.log('  Password: QueueLess@123');
  console.log('  Role:     OWNER');
  console.log('  Shop:     Sri Lakshmi Tea & Snacks');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
