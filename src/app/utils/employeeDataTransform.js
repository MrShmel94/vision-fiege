import { format } from 'date-fns';

export const transformEmployeeData = (data) => {
  const DATETIME_FIELDS = [
    'validFromAccount',
    'validToAccount',
  ];

  const transformDateTime = (dateString) => {
    if (!dateString) return format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
    return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm:ss");
  };

  return {
    expertis: data.expertis,
    zalosId: data.zalosId || null,
    brCode: data.brCode || null,
    firstName: data.firstName,
    lastName: data.lastName,
    sex: data.sex,
    site: data.siteName,
    shift: data.shiftName,
    department: data.departmentName,
    team: data.teamName,
    country: data.countryName,
    position: data.positionName,
    agency: data.agencyName,
    isWork: data.isWork ?? true,
    isSupervisor : data.isSupervisor ?? false,
    isCanHasAccount: data.isCanHasAccount ?? false,
    validToAccount: transformDateTime(data.validToAccount),
    validFromAccount: transformDateTime(data.validFromAccount),
    note: data.note || "",
    dateStartContract: data.dateStartContract,
    dateFinishContract: data.dateFinishContract,
    dateBhpNow: data.dateBhpNow || null,
    dateBhpFuture: data.dateBhpFuture || null,
    dateAdrNow: data.dateAdrNow || null,
    dateAdrFuture: data.dateAdrFuture || null,
    fte: data.fte || 1.0
  };
}; 