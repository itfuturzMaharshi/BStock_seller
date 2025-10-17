import ActivitiesTable from "../../components/activities/ActivitiesTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const Activities = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Products" />
      <div className="space-y-6">
        <ActivitiesTable />
      </div>
    </>
  );
};

export default Activities;