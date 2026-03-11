import { ReportsGateway } from './reports.gateway';

describe('ReportsGateway', () => {
  it('emits report.created events', () => {
    const gateway = new ReportsGateway();
    const emit = jest.fn();
    gateway.server = { emit } as any;

    const payload = {
      Id: 1,
      Code: 'RPT-20260311-ABC123',
      ExactLocation: 'Frente al parque',
      Description: 'Fuga de agua',
      ReportState: 'Pendiente',
      CreatedAt: new Date('2026-03-11T10:00:00.000Z'),
      ReportLocation: { Id: 2, Neighborhood: 'Centro' },
      ReportType: { Id: 3, Name: 'Fuga' },
      ReportedBy: {
        Id: 4,
        Name: 'Ana',
        Email: 'ana@example.com',
        FullName: 'Ana Perez',
      },
    };

    gateway.emitReportCreated(payload);

    expect(emit).toHaveBeenCalledWith('report.created', payload);
  });
});
