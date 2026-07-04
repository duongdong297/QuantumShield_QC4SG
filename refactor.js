const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'dashboard', 'src', 'App.tsx');
let content = fs.readFileSync(appPath, 'utf-8');

// 1. Rename currentTab to activeTab
content = content.replace(/const \[currentTab, setCurrentTab\] = useState<string>\('Dashboard'\);/, "const [activeTab, setActiveTab] = useState<string>('dashboard');");
content = content.replace(/<Sidebar currentTab={currentTab} onTabChange={setCurrentTab} \/>/, "<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />");

const topNavReplace = `<TopNavbar title={activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'outbreak_maps' ? 'Outbreak Maps' : activeTab === 'resource_tables' ? 'Resource Tables' : 'Audit Logs'} />`;
content = content.replace(/<TopNavbar title={currentTab} \/>/, topNavReplace);

// 2. Extract the body
const startMarker = "{/* FLOATING KPI CARDS ROW & MAIN GRID CONTAINER */}";
const endMarker = "{/* Global style injections for animations and grids */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const bodyContent = content.substring(startIndex, endIndex);
  
  // Replace body with view routing
  const routingCode = `
        {activeTab === 'dashboard' && (
          <DashboardView 
            error={error} displayAlert={displayAlert} hotspotsData={hotspotsData} 
            chartData={chartData} displayForecast={displayForecast} recommendations={recommendations} 
            handleExecuteAction={handleExecuteAction} selectedProvince={selectedProvince} 
            setSelectedProvince={setSelectedProvince} isAnalyzing={isAnalyzing} insightData={insightData} 
          />
        )}
        {activeTab === 'outbreak_maps' && <OutbreakMapsView />}
        {activeTab === 'resource_tables' && <ResourceTablesView />}
        {activeTab === 'audit_logs' && <AuditLogsView />}
        
        `;
        
  content = content.substring(0, startIndex) + routingCode + content.substring(endIndex);
  
  // 3. Define the components at the top (before const App)
  const viewsCode = `
const OutbreakMapsView = () => <div style={{ padding: '2rem', fontSize: '1.25rem', color: '#525f7f' }}>Coming soon</div>;
const ResourceTablesView = () => <div style={{ padding: '2rem', fontSize: '1.25rem', color: '#525f7f' }}>Coming soon</div>;
const AuditLogsView = () => <div style={{ padding: '2rem', fontSize: '1.25rem', color: '#525f7f' }}>Coming soon</div>;

const DashboardView = ({ error, displayAlert, hotspotsData, chartData, displayForecast, recommendations, handleExecuteAction, selectedProvince, setSelectedProvince, isAnalyzing, insightData }: any) => {
  return (
    <>
      ${bodyContent}
    </>
  );
};

`;

  const appDeclaration = "const App: React.FC = () => {";
  content = content.replace(appDeclaration, viewsCode + appDeclaration);
  
  fs.writeFileSync(appPath, content, 'utf-8');
  console.log("Refactored successfully!");
} else {
  console.log("Could not find markers.");
}
