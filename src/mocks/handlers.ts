import { http, HttpResponse } from 'msw';

const base = 'http://localhost:3000/api/v1';

export const handlers = [
  http.get(`${base}/me`, () => {
    return HttpResponse.json({
      user: {
        id: 1,
        email: 'customer@helpdesk.local',
        name: 'Alice Johnson',
        role: { code: 'customer', label: 'Customer' },
        disabled: false,
      },
    });
  }),

  http.get(`${base}/tickets`, ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get('q')?.toLowerCase() ?? '';
    const tickets = [
      {
        id: 1,
        title: 'Printer jam',
        description: 'Paper stuck',
        status: { code: 'open', label: 'Open' },
        priority: { code: 'high', label: 'High' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer: {
          id: 1,
          email: 'customer@helpdesk.local',
          name: 'Alice Johnson',
          role: { code: 'customer', label: 'Customer' },
          disabled: false,
        },
        assignee: null,
        comments_count: 0,
        attachments_count: 0,
        tags: [],
      },
    ];

    const filtered =
      q.length >= 2
        ? tickets.filter(
            (ticket) =>
              ticket.title.toLowerCase().includes(q) ||
              ticket.description.toLowerCase().includes(q),
          )
        : tickets;

    return HttpResponse.json({ tickets: filtered });
  }),

  http.post(`${base}/session`, async () => {
    return HttpResponse.json(
      {
        user: {
          id: 1,
          email: 'customer@helpdesk.local',
          name: 'Alice Johnson',
          role: { code: 'customer', label: 'Customer' },
          disabled: false,
        },
      },
      { status: 201 },
    );
  }),
];
