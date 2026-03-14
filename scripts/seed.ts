import { prisma } from "@/db/prisma";
import { createRealPlannerSeed } from "@/lib/real-plan-seed";

const seed = async () => {
  const state = createRealPlannerSeed();

  await prisma.note.deleteMany();
  await prisma.rsvp.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.task.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.vendorCategory.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.weddingTable.deleteMany();
  await prisma.userInvitation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.wedding.deleteMany();

  await prisma.wedding.create({
    data: {
      id: state.wedding.id,
      slug: state.wedding.slug,
      title: state.wedding.title,
      coupleOneName: state.wedding.coupleOneName,
      coupleTwoName: state.wedding.coupleTwoName,
      venueName: state.wedding.venueName,
      venueAddress: state.wedding.venueAddress,
      ceremonyDate: new Date(state.wedding.ceremonyDate),
    },
  });

  await prisma.user.createMany({
    data: state.users.map((user) => ({
      id: user.id,
      weddingId: user.weddingId,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordHash: user.passwordHash,
    })),
  });

  await prisma.userInvitation.createMany({
    data: state.userInvitations.map((invitation) => ({
      id: invitation.id,
      weddingId: invitation.weddingId,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      acceptedAt: invitation.acceptedAt
        ? new Date(invitation.acceptedAt)
        : null,
      expiresAt: new Date(invitation.expiresAt),
    })),
    skipDuplicates: true,
  });

  await prisma.weddingTable.createMany({
    data: state.weddingTables.map((table) => ({
      id: table.id,
      weddingId: table.weddingId,
      name: table.name,
      capacity: table.capacity,
    })),
  });

  await prisma.guest.createMany({
    data: state.guests.map((guest) => ({
      id: guest.id,
      weddingId: guest.weddingId,
      firstName: guest.firstName,
      lastName: guest.lastName,
      side: guest.side,
      rsvpStatus: guest.rsvpStatus,
      rsvpToken: guest.rsvpToken,
      dietaryRestrictions: guest.dietaryRestrictions,
      paymentCoverage: guest.paymentCoverage,
      transportToVenue: guest.transportToVenue,
      transportFromVenue: guest.transportFromVenue,
      tableId: guest.tableId,
    })),
  });

  await prisma.vendorCategory.createMany({
    data: state.vendorCategories.map((category) => ({
      id: category.id,
      weddingId: category.weddingId,
      name: category.name,
      type: category.type,
    })),
  });

  await prisma.vendor.createMany({
    data: state.vendors.map((vendor) => ({
      id: vendor.id,
      weddingId: vendor.weddingId,
      categoryId: vendor.categoryId,
      name: vendor.name,
      cost: vendor.cost,
    })),
  });

  await prisma.budgetCategory.createMany({
    data: state.budgetCategories.map((category) => ({
      id: category.id,
      weddingId: category.weddingId,
      name: category.name,
      plannedAmount: category.plannedAmount,
      color: category.color,
      notes: category.notes,
    })),
  });

  await prisma.expense.createMany({
    data: state.expenses.map((expense) => ({
      id: expense.id,
      weddingId: expense.weddingId,
      categoryId: expense.categoryId,
      name: expense.name,
      estimateMin: expense.estimateMin,
      estimateMax: expense.estimateMax,
      actualAmount: expense.actualAmount,
      notes: expense.notes,
    })),
  });

  await prisma.payment.createMany({
    data: state.payments.map((payment) => ({
      id: payment.id,
      weddingId: payment.weddingId,
      expenseId: payment.expenseId,
      amount: payment.amount,
      paidAt: new Date(payment.paidAt),
      notes: payment.notes,
    })),
  });

  await prisma.task.createMany({
    data: state.tasks.map((task) => ({
      id: task.id,
      weddingId: task.weddingId,
      title: task.title,
      description: task.description,
      dueDate: new Date(task.dueDate),
      priority: task.priority,
      status: task.status,
      assignee: task.assignee,
    })),
  });

  await prisma.timelineEvent.createMany({
    data: state.timelineEvents.map((event) => ({
      id: event.id,
      weddingId: event.weddingId,
      title: event.title,
      description: event.description,
      startsAt: new Date(event.startsAt),
      location: event.location,
    })),
  });

  await prisma.seat.createMany({
    data: state.seats.map((seat) => ({
      id: seat.id,
      weddingId: seat.weddingId,
      tableId: seat.tableId,
      guestId: seat.guestId,
      label: seat.label,
      position: seat.position,
    })),
  });

  await prisma.rsvp.createMany({
    data: state.rsvps.map((rsvp) => ({
      id: rsvp.id,
      weddingId: rsvp.weddingId,
      guestId: rsvp.guestId,
      status: rsvp.status,
      guestCount: rsvp.guestCount,
    })),
  });

  await prisma.contact.createMany({
    data: state.contacts.map((contact) => ({
      id: contact.id,
      weddingId: contact.weddingId,
      guestId: contact.guestId,
      vendorId: contact.vendorId,
      email: contact.email,
      phone: contact.phone,
    })),
  });

  await prisma.note.createMany({
    data: state.notes.map((note) => ({
      id: note.id,
      weddingId: note.weddingId,
      guestId: note.guestId,
      vendorId: note.vendorId,
      taskId: note.taskId,
      content: note.content,
    })),
  });
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
