import { NotificationsGateway } from './notification.gateway';

describe('NotificationsGateway', () => {
  it('emits averia alerts only to admins room', () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    const gateway = new NotificationsGateway({} as any, {} as any);
    gateway.server = { to } as any;

    const payload = { Id: 1, Code: 'RPT-1' };

    gateway.emitAveriaAlert(payload);

    expect(to).toHaveBeenCalledWith('admins');
    expect(emit).toHaveBeenCalledWith('averia:nueva', payload);
  });

  it('emits general notifications to all connected clients', () => {
    const emit = jest.fn();
    const gateway = new NotificationsGateway({} as any, {} as any);
    gateway.server = { emit } as any;

    gateway.emitGeneralNotification('corte-agua', { Id: 2 });

    expect(emit).toHaveBeenCalledWith('notificacion:corte-agua', { Id: 2 });
  });

  it('emits user notifications only to the user room', () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    const gateway = new NotificationsGateway({} as any, {} as any);
    gateway.server = { to } as any;

    gateway.emitUserNotification('7', { Id: 3 });

    expect(to).toHaveBeenCalledWith('user:7');
    expect(emit).toHaveBeenCalledWith('solicitud:resuelta', { Id: 3 });
  });

  it('maps the legacy report method to the admin-only averia event', () => {
    const gateway = new NotificationsGateway({} as any, {} as any);
    const emitAveriaAlert = jest.spyOn(gateway, 'emitAveriaAlert').mockImplementation();

    gateway.emitReportCreated({ Id: 4 });

    expect(emitAveriaAlert).toHaveBeenCalledWith({ Id: 4 });
  });
});
